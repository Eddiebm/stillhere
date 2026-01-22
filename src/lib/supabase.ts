import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rzhpydydecvakrtwwxfl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6aHB5ZHlkZWN2YWtydHd3eGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyOTQxNjMsImV4cCI6MjA4Mjg3MDE2M30.8YfEQMaNUHZe0vZoAjVlJf7SwTRs4rjPTdR128ZXOks';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SUPABASE_URL = supabaseUrl;

export type Post = {
  id: string;
  user_id: string;
  platform: string;
  platforms?: string[];
  content: string;
  status: 'draft' | 'scheduled' | 'published' | 'rejected' | 'approved';
  scheduled_for: string | null;
  campaign_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ConnectedAccount = {
  id: string;
  user_id: string;
  platform: string;
  platform_username: string;
  is_active: boolean;
  connected_at: string;
};

export type UserProfile = {
  id: string;
  user_id: string;
  role: string | null;
  company_name: string | null;
  industry: string | null;
  business_description: string | null;
  tone: string;
  onboarding_completed: boolean;
  website_url: string | null;
  website_content: string | null;
  openai_api_key: string | null;
  target_audience: string | null;
  value_proposition: string | null;
  competitors: string | null;
  business_goals: string | null;
  created_at: string;
  updated_at: string;
};

export type BusinessInsights = {
  id: string;
  user_id: string;
  insights_json: {
    businessSummary?: {
      overview: string;
      strengths: string[];
      targetPersona: string;
    };
    contentStrategy?: {
      pillars: { name: string; description: string; examples: string[] }[];
      bestPlatforms: { platform: string; reason: string }[];
      postingFrequency: string;
    };
    competitivePositioning?: {
      differentiation: string;
      gaps: string[];
      uniqueAngles: string[];
    };
    quickWins?: { action: string; impact: string; effort: string }[];
  };
  generated_at: string;
  created_at: string;
  updated_at: string;
};

export type Campaign = {
  id: string;
  user_id: string;
  name: string;
  platform: string;
  platforms?: string[];
  topic: string | null;
  post_count: number;
  frequency: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type PlatformCredential = {
  id: string;
  user_id: string;
  platform: string;
  credentials: Record<string, string>;
  is_connected: boolean;
  connected_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  tier: 'free' | 'starter' | 'pro' | 'agency';
  posts_limit: number;
  platforms_limit: number;
  current_month_posts: number;
  billing_cycle_start: string;
  created_at: string;
  updated_at: string;
};

export const PLATFORMS = [
  { id: 'twitter', name: 'Twitter / X', color: 'text-sky-400', bgColor: 'bg-sky-500/20', charLimit: 280 },
  { id: 'linkedin', name: 'LinkedIn', color: 'text-blue-500', bgColor: 'bg-blue-500/20', charLimit: 3000 },
  { id: 'instagram', name: 'Instagram', color: 'text-pink-500', bgColor: 'bg-pink-500/20', charLimit: 2200 },
  { id: 'facebook', name: 'Facebook', color: 'text-blue-600', bgColor: 'bg-blue-600/20', charLimit: 63206 },
  { id: 'tiktok', name: 'TikTok', color: 'text-white', bgColor: 'bg-gray-800', charLimit: 2200 },
  { id: 'youtube', name: 'YouTube', color: 'text-red-500', bgColor: 'bg-red-500/20', charLimit: 5000 },
  { id: 'threads', name: 'Threads', color: 'text-white', bgColor: 'bg-gray-700', charLimit: 500 },
  { id: 'pinterest', name: 'Pinterest', color: 'text-red-600', bgColor: 'bg-red-600/20', charLimit: 500 },
  { id: 'bluesky', name: 'Bluesky', color: 'text-blue-400', bgColor: 'bg-blue-400/20', charLimit: 300 },
  { id: 'mastodon', name: 'Mastodon', color: 'text-purple-500', bgColor: 'bg-purple-500/20', charLimit: 500 },
];

export type Notification = {
  id: string;
  user_id: string;
  type: 'pending' | 'scheduled' | 'update' | 'digest';
  title: string;
  message: string;
  read: boolean;
  action_url: string | null;
  created_at: string;
  updated_at: string;
};

export const PRICING_TIERS = [
  { id: 'free', name: 'Free', price: 0, posts: 3, platforms: 1, features: ['3 posts per month', '1 platform', 'Basic analytics', 'Email support'] },
  { id: 'starter', name: 'Starter', price: 29, posts: 12, platforms: 3, features: ['12 posts per month', '3 platforms', 'AI content generation', 'Scheduling', 'Priority support'] },
  { id: 'pro', name: 'Pro', price: 79, posts: 30, platforms: 10, features: ['30 posts per month', 'Unlimited platforms', 'Advanced AI', 'Analytics dashboard', 'Team collaboration', 'API access'] },
  { id: 'agency', name: 'Agency', price: 199, posts: 100, platforms: 10, features: ['100 posts per month', '5 client accounts', 'White-label option', 'Dedicated support', 'Custom integrations', 'SLA guarantee'] },
];
