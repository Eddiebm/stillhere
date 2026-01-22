-- Migration: add_platform_credentials_and_subscriptions
-- Created at: 1768971996


-- Platform credentials table (for user-provided API keys/tokens)
CREATE TABLE IF NOT EXISTS platform_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    platform TEXT NOT NULL,
    credentials JSONB NOT NULL DEFAULT '{}',
    is_connected BOOLEAN DEFAULT false,
    connected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    tier TEXT DEFAULT 'free',
    posts_limit INTEGER DEFAULT 3,
    platforms_limit INTEGER DEFAULT 1,
    current_month_posts INTEGER DEFAULT 0,
    billing_cycle_start TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add website_url and openai_key to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS website_content TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS openai_api_key TEXT;

-- Add platforms array to posts (for multi-platform)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS platforms TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Enable RLS
ALTER TABLE platform_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for platform_credentials
CREATE POLICY "Users can view own credentials" ON platform_credentials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own credentials" ON platform_credentials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own credentials" ON platform_credentials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own credentials" ON platform_credentials FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for subscriptions
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);
;