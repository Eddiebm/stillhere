import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, SUPABASE_URL } from '../lib/supabase';
import { ArrowRight, ArrowLeft, User, Briefcase, MessageSquare, Globe, Loader2, Target, Zap, Users, Flag } from 'lucide-react';

const ROLES = ['Founder/CEO', 'Marketing Lead', 'Content Creator', 'Social Media Manager', 'Growth Lead', 'Other'];
const INDUSTRIES = ['SaaS', 'E-commerce', 'Fintech', 'Healthcare', 'Education', 'Agency', 'Consulting', 'Other'];
const TONES = [
  { value: 'professional', label: 'Professional', desc: 'Polished and business-focused' },
  { value: 'casual', label: 'Casual', desc: 'Friendly and approachable' },
  { value: 'thought_leader', label: 'Thought Leader', desc: 'Authoritative and insightful' },
  { value: 'witty', label: 'Witty', desc: 'Clever with personality' },
];

const BUSINESS_GOALS = [
  { value: 'brand_awareness', label: 'Brand Awareness', desc: 'Like a new startup getting the word out' },
  { value: 'lead_generation', label: 'Lead Generation', desc: 'Like a B2B SaaS building pipeline' },
  { value: 'sales_conversions', label: 'Sales / Conversions', desc: 'Like an e-commerce store driving purchases' },
  { value: 'thought_leadership', label: 'Thought Leadership', desc: 'Like a consultant building authority' },
];

const EXAMPLES = {
  target_audience: [
    { brand: 'Nike', example: 'Athletes and fitness enthusiasts aged 18-35' },
    { brand: 'Slack', example: 'Remote teams and tech companies' },
    { brand: 'Mailchimp', example: 'Small business owners needing email marketing' },
  ],
  value_proposition: [
    { brand: 'Apple', example: 'Premium design + seamless ecosystem' },
    { brand: 'Dollar Shave Club', example: 'Quality razors, no hassle, low price' },
    { brand: 'Zoom', example: 'Video calls that just work' },
  ],
  competitors: [
    { brand: 'Burger King', example: "McDonald's, Wendy's" },
    { brand: 'Spotify', example: 'Apple Music, YouTube Music' },
    { brand: 'Figma', example: 'Sketch, Adobe XD' },
  ],
};

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    company_name: '',
    industry: '',
    business_description: '',
    tone: 'professional',
    website_url: '',
    website_content: '',
    target_audience: '',
    value_proposition: '',
    competitors: '',
    business_goals: '',
  });

  async function scrapeWebsite() {
    if (!formData.website_url) return;
    setScraping(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/scrape-website`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.website_url }),
      });
      const data = await response.json();
      if (data.content) {
        setFormData(prev => ({
          ...prev,
          website_content: data.content,
          business_description: prev.business_description || data.description || '',
        }));
      }
    } catch (error) {
      console.error('Error scraping website:', error);
    } finally {
      setScraping(false);
    }
  }

  async function handleComplete() {
    if (!user) return;
    setLoading(true);
    try {
      await supabase.from('user_profiles').upsert({
        user_id: user.id,
        ...formData,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      
      await supabase.from('subscriptions').upsert({
        user_id: user.id,
        tier: 'free',
        posts_limit: 3,
        platforms_limit: 1,
      }, { onConflict: 'user_id' });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  }

  const canProceed = () => {
    if (step === 1) return formData.role && formData.company_name && formData.industry;
    if (step === 2) return true;
    if (step === 3) return formData.business_description.length > 10;
    if (step === 4) return formData.target_audience.length > 5;
    if (step === 5) return formData.value_proposition.length > 5;
    if (step === 6) return true;
    if (step === 7) return formData.business_goals;
    return true;
  };

  const totalSteps = 8;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <img src="/images/logo.png" alt="StillHereHQ" className="h-10 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Welcome</h1>
          <p className="text-gray-400">Let's understand your business to create better content</p>
        </div>

        <div className="flex items-center justify-center gap-1 mb-8">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className={`h-2 w-8 rounded-full transition-all ${i + 1 <= step ? 'bg-white' : 'bg-gray-700'}`} />
          ))}
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-gray-400" />
                <h2 className="text-xl font-semibold">Tell us about you</h2>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Your Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => setFormData({ ...formData, role })}
                      className={`px-4 py-3 rounded-lg border text-left text-sm transition ${
                        formData.role === role ? 'border-white bg-white/10' : 'border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Company Name</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-500"
                  placeholder="Acme Inc."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Industry</label>
                <div className="grid grid-cols-2 gap-2">
                  {INDUSTRIES.map((ind) => (
                    <button
                      key={ind}
                      onClick={() => setFormData({ ...formData, industry: ind })}
                      className={`px-4 py-3 rounded-lg border text-left text-sm transition ${
                        formData.industry === ind ? 'border-white bg-white/10' : 'border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-gray-400" />
                <h2 className="text-xl font-semibold">Your Website</h2>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Website URL (optional)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-500"
                    placeholder="https://yourcompany.com"
                  />
                  <button
                    onClick={scrapeWebsite}
                    disabled={!formData.website_url || scraping}
                    className="px-4 py-3 bg-white text-black rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {scraping ? 'Scanning...' : 'Scan'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">We'll analyze your website to understand your business better</p>
              </div>

              {formData.website_content && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-400 text-sm">Website content extracted successfully</p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-6 h-6 text-gray-400" />
                <h2 className="text-xl font-semibold">What do you do?</h2>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Brief description of your business</label>
                <textarea
                  value={formData.business_description}
                  onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 h-40 focus:outline-none focus:border-gray-500 resize-none"
                  placeholder="We help small businesses automate their social media presence..."
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-gray-400" />
                <h2 className="text-xl font-semibold">Who are you trying to reach?</h2>
              </div>
              <p className="text-gray-400 text-sm -mt-4 mb-4">Describe your ideal customer</p>

              <div>
                <textarea
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 h-28 focus:outline-none focus:border-gray-500 resize-none"
                  placeholder="e.g., Marketing managers at mid-size tech companies..."
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Examples from famous brands:</p>
                {EXAMPLES.target_audience.map((ex, i) => (
                  <div key={i} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-3">
                    <span className="text-white font-medium">{ex.brand}:</span>
                    <span className="text-gray-400 ml-2">{ex.example}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-6 h-6 text-gray-400" />
                <h2 className="text-xl font-semibold">What makes you different?</h2>
              </div>
              <p className="text-gray-400 text-sm -mt-4 mb-4">Why should customers choose you over competitors?</p>

              <div>
                <textarea
                  value={formData.value_proposition}
                  onChange={(e) => setFormData({ ...formData, value_proposition: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 h-28 focus:outline-none focus:border-gray-500 resize-none"
                  placeholder="e.g., We're faster, more affordable, and easier to use..."
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Examples from famous brands:</p>
                {EXAMPLES.value_proposition.map((ex, i) => (
                  <div key={i} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-3">
                    <span className="text-white font-medium">{ex.brand}:</span>
                    <span className="text-gray-400 ml-2">{ex.example}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-gray-400" />
                <h2 className="text-xl font-semibold">Who else does what you do?</h2>
              </div>
              <p className="text-gray-400 text-sm -mt-4 mb-4">List 2-3 main competitors (optional)</p>

              <div>
                <textarea
                  value={formData.competitors}
                  onChange={(e) => setFormData({ ...formData, competitors: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 h-28 focus:outline-none focus:border-gray-500 resize-none"
                  placeholder="e.g., Company A, Company B, Company C"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Examples:</p>
                {EXAMPLES.competitors.map((ex, i) => (
                  <div key={i} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-3">
                    <span className="text-white font-medium">{ex.brand}'s competitors:</span>
                    <span className="text-gray-400 ml-2">{ex.example}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Flag className="w-6 h-6 text-gray-400" />
                <h2 className="text-xl font-semibold">What do you want to achieve?</h2>
              </div>
              <p className="text-gray-400 text-sm -mt-4 mb-4">Pick your top priority</p>

              <div className="space-y-3">
                {BUSINESS_GOALS.map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => setFormData({ ...formData, business_goals: goal.value })}
                    className={`w-full px-4 py-4 rounded-lg border text-left transition ${
                      formData.business_goals === goal.value ? 'border-white bg-white/10' : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <p className="font-medium">{goal.label}</p>
                    <p className="text-sm text-gray-400">{goal.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-6 h-6 text-gray-400" />
                <h2 className="text-xl font-semibold">Your voice</h2>
              </div>
              <p className="text-gray-400 text-sm -mt-4 mb-4">How should your content sound?</p>

              <div className="space-y-3">
                {TONES.map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => setFormData({ ...formData, tone: tone.value })}
                    className={`w-full px-4 py-4 rounded-lg border text-left transition ${
                      formData.tone === tone.value ? 'border-white bg-white/10' : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <p className="font-medium">{tone.label}</p>
                    <p className="text-sm text-gray-400">{tone.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Get Started'}
              </button>
            )}
          </div>
        </div>

        <button onClick={() => navigate('/dashboard')} className="w-full text-center text-gray-500 hover:text-gray-300 mt-4 text-sm">
          Skip for now
        </button>
      </div>
    </div>
  );
}
