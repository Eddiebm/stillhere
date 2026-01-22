import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, UserProfile, PLATFORMS, SUPABASE_URL } from '../lib/supabase';
import PlatformIcon from '../components/PlatformIcon';
import { ArrowLeft, Sparkles, CheckCircle, Loader2 } from 'lucide-react';

const TOPICS = [
  'Product updates',
  'Industry insights',
  'Personal journey',
  'Tips and advice',
  'Behind the scenes',
  'Customer stories',
];

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: '3x_week', label: '3x per week' },
  { value: 'weekly', label: 'Weekly' },
];

export default function CreateCampaign() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<{ platform: string; content: string }[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    platforms: ['twitter'] as string[],
    topic: 'Product updates',
    post_count: 5,
    frequency: 'daily',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [user]);

  async function loadProfile() {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();
    setProfile(data);
  }

  function togglePlatform(platformId: string) {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !formData.name || formData.platforms.length === 0) return;
    
    setLoading(true);
    setGeneratedPosts([]);
    
    try {
      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          user_id: user.id,
          name: formData.name,
          platform: formData.platforms[0],
          topic: formData.topic,
          post_count: formData.post_count,
          frequency: formData.frequency,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      const allPosts: { platform: string; content: string }[] = [];
      const postsPerPlatform = Math.ceil(formData.post_count / formData.platforms.length);

      // Generate posts for each platform
      for (const platform of formData.platforms) {
        try {
          const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profile: {
                company_name: profile?.company_name,
                industry: profile?.industry,
                tone: profile?.tone,
                business_description: profile?.business_description,
                website_content: profile?.website_content,
              },
              topic: formData.topic,
              platform,
              count: postsPerPlatform,
              userApiKey: profile?.openai_api_key,
            }),
          });

          const data = await response.json();
          if (data.posts && Array.isArray(data.posts)) {
            for (const content of data.posts) {
              allPosts.push({ platform, content });
            }
          }
        } catch (error) {
          console.error(`Error generating posts for ${platform}:`, error);
          // Fallback posts
          for (let i = 0; i < postsPerPlatform; i++) {
            allPosts.push({
              platform,
              content: `Great content about ${formData.topic} coming soon from ${profile?.company_name || 'our company'}!`,
            });
          }
        }
      }

      // Insert posts into database
      for (const post of allPosts.slice(0, formData.post_count)) {
        await supabase.from('posts').insert({
          user_id: user.id,
          campaign_id: campaign.id,
          platform: post.platform,
          content: post.content,
          status: 'draft',
        });
      }

      setGeneratedPosts(allPosts.slice(0, formData.post_count));
      
      // Create notification for pending posts
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'pending',
        title: `${allPosts.slice(0, formData.post_count).length} new posts pending approval`,
        message: `Campaign "${formData.name}" generated ${allPosts.slice(0, formData.post_count).length} draft posts. Review and schedule them.`,
        action_url: '/dashboard?tab=queue',
      });
      
      setSuccess(true);
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Campaign Created!</h1>
            <p className="text-gray-400">
              {generatedPosts.length} draft posts have been added to your Content Queue
            </p>
          </div>

          {generatedPosts.length > 0 && (
            <div className="space-y-4 mb-8">
              <h2 className="text-lg font-semibold">Generated Posts Preview</h2>
              {generatedPosts.slice(0, 5).map((post, i) => (
                <div key={i} className="bg-[#111] border border-gray-800 rounded-xl p-4 flex items-start gap-4">
                  <PlatformIcon platform={post.platform} />
                  <div className="flex-1">
                    <p className="text-gray-300 text-sm">{post.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">
                        {post.content.length} / {PLATFORMS.find(p => p.id === post.platform)?.charLimit || 280} chars
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {generatedPosts.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  +{generatedPosts.length - 5} more posts in queue
                </p>
              )}
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard?tab=queue')}
              className="bg-white text-black px-6 py-2 rounded-lg font-medium"
            >
              View Content Queue
            </button>
            <button
              onClick={() => { setSuccess(false); setFormData({ ...formData, name: '' }); }}
              className="border border-gray-700 px-6 py-2 rounded-lg hover:border-gray-500"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-3xl mx-auto p-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold mb-2">Create Campaign</h1>
        <p className="text-gray-400 mb-8">Set up a content campaign and generate AI-powered draft posts</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6 space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Campaign Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-500"
                placeholder="Q1 Product Launch"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Platforms (select multiple)</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => togglePlatform(platform.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition ${
                      formData.platforms.includes(platform.id)
                        ? 'border-white bg-white/10'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <PlatformIcon platform={platform.id} className="w-6 h-6" />
                    <span className="text-xs">{platform.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected: {formData.platforms.length} platform(s)
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Topic / Theme</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setFormData({ ...formData, topic })}
                    className={`px-4 py-3 rounded-lg border text-left text-sm transition ${
                      formData.topic === topic
                        ? 'border-white bg-white/10'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Number of Posts</label>
                <div className="flex gap-2">
                  {[3, 5, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFormData({ ...formData, post_count: n })}
                      className={`flex-1 py-3 rounded-lg border text-center transition ${
                        formData.post_count === n
                          ? 'border-white bg-white/10'
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Posting Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-500"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {formData.platforms.length > 0 && (
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Platform Previews</h3>
              <div className="space-y-4">
                {formData.platforms.map(platformId => {
                  const platform = PLATFORMS.find(p => p.id === platformId);
                  return (
                    <div key={platformId} className="flex items-center gap-4 p-3 bg-[#1a1a1a] rounded-lg">
                      <PlatformIcon platform={platformId} className="w-5 h-5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{platform?.name}</p>
                        <p className="text-xs text-gray-500">Max {platform?.charLimit.toLocaleString()} characters</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        ~{Math.ceil(formData.post_count / formData.platforms.length)} posts
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !formData.name || formData.platforms.length === 0}
            className="w-full bg-white text-black py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Posts
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
