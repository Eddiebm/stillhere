import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, UserProfile, BusinessInsights, SUPABASE_URL } from '../lib/supabase';
import { ArrowLeft, RefreshCw, Loader2, Lightbulb, Target, Compass, Zap, CheckCircle, TrendingUp } from 'lucide-react';
import PlatformIcon from '../components/PlatformIcon';

export default function Insights() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [insights, setInsights] = useState<BusinessInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const [profileRes, insightsRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', user?.id).maybeSingle(),
        supabase.from('business_insights').select('*').eq('user_id', user?.id).maybeSingle(),
      ]);
      
      setProfile(profileRes.data);
      setInsights(insightsRes.data);
      
      // Auto-generate if no insights exist
      if (!insightsRes.data && profileRes.data) {
        await generateInsights(profileRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function generateInsights(profileData?: UserProfile) {
    const p = profileData || profile;
    if (!user || !p) return;
    
    setRegenerating(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            company_name: p.company_name,
            industry: p.industry,
            business_description: p.business_description,
            target_audience: p.target_audience,
            value_proposition: p.value_proposition,
            competitors: p.competitors,
            business_goals: p.business_goals,
            tone: p.tone,
            website_content: p.website_content,
          },
          userApiKey: p.openai_api_key,
        }),
      });

      const data = await response.json();
      
      if (data.insights) {
        await supabase.from('business_insights').upsert({
          user_id: user.id,
          insights_json: data.insights,
          generated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
        
        const { data: newInsights } = await supabase
          .from('business_insights')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        setInsights(newInsights);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setRegenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const data = insights?.insights_json || {};

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-800 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Business Insights</h1>
              <p className="text-gray-400">AI-powered analysis for {profile?.company_name || 'your business'}</p>
            </div>
          </div>
          
          <button
            onClick={() => generateInsights()}
            disabled={regenerating}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {regenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Re-analyze
              </>
            )}
          </button>
        </div>

        {insights?.generated_at && (
          <p className="text-xs text-gray-500 mb-6">
            Last updated: {new Date(insights.generated_at).toLocaleDateString()} at {new Date(insights.generated_at).toLocaleTimeString()}
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Business Summary */}
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Lightbulb className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold">Business Summary</h2>
            </div>
            
            {data.businessSummary ? (
              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed">{data.businessSummary.overview}</p>
                
                <div>
                  <p className="text-sm text-gray-400 mb-2">Key Strengths:</p>
                  <div className="flex flex-wrap gap-2">
                    {data.businessSummary.strengths?.map((strength, i) => (
                      <span key={i} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Target Persona:</p>
                  <p className="text-white">{data.businessSummary.targetPersona}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No summary available. Click "Re-analyze" to generate.</p>
            )}
          </div>

          {/* Content Strategy */}
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold">Content Strategy</h2>
            </div>
            
            {data.contentStrategy ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-3">Content Pillars:</p>
                  <div className="space-y-3">
                    {data.contentStrategy.pillars?.slice(0, 4).map((pillar, i) => (
                      <div key={i} className="bg-[#1a1a1a] rounded-lg p-3">
                        <p className="font-medium text-white mb-1">{pillar.name}</p>
                        <p className="text-sm text-gray-400">{pillar.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-2">Best Platforms:</p>
                  <div className="space-y-2">
                    {data.contentStrategy.bestPlatforms?.map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <PlatformIcon platform={p.platform.toLowerCase().replace('/', '').replace(' ', '')} className="w-5 h-5" />
                        <div>
                          <p className="text-white text-sm">{p.platform}</p>
                          <p className="text-xs text-gray-500">{p.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <p className="text-sm text-gray-400 mb-1">Posting Frequency:</p>
                  <p className="text-white text-sm">{data.contentStrategy.postingFrequency}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No strategy available. Click "Re-analyze" to generate.</p>
            )}
          </div>

          {/* Competitive Positioning */}
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Compass className="w-5 h-5 text-orange-400" />
              </div>
              <h2 className="text-lg font-semibold">Competitive Positioning</h2>
            </div>
            
            {data.competitivePositioning ? (
              <div className="space-y-4">
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <p className="text-sm text-gray-400 mb-1">How to Differentiate:</p>
                  <p className="text-white text-sm">{data.competitivePositioning.differentiation}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-2">Gaps to Exploit:</p>
                  <ul className="space-y-2">
                    {data.competitivePositioning.gaps?.map((gap, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-2">Unique Angles:</p>
                  <div className="flex flex-wrap gap-2">
                    {data.competitivePositioning.uniqueAngles?.map((angle, i) => (
                      <span key={i} className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs">
                        {angle}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No positioning available. Click "Re-analyze" to generate.</p>
            )}
          </div>

          {/* Quick Wins */}
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-lg font-semibold">Quick Wins</h2>
              <span className="text-xs text-gray-500">Start here for immediate impact</span>
            </div>
            
            {data.quickWins && data.quickWins.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-4">
                {data.quickWins.map((win, i) => (
                  <div key={i} className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-1.5 bg-green-500/20 rounded">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        win.effort === 'Low' ? 'bg-green-500/20 text-green-400' :
                        win.effort === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {win.effort} effort
                      </span>
                    </div>
                    <p className="text-white font-medium mb-2">{win.action}</p>
                    <p className="text-sm text-gray-400">{win.impact}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No quick wins available. Click "Re-analyze" to generate.</p>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Ready to create content?</h3>
          <p className="text-gray-400 mb-4">Use these insights to generate your first AI-powered posts</p>
          <button
            onClick={() => navigate('/create-campaign')}
            className="bg-white text-black px-6 py-2 rounded-lg font-medium"
          >
            Create Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
