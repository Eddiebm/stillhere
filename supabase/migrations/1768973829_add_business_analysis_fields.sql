-- Migration: add_business_analysis_fields
-- Created at: 1768973829


-- Add business analysis fields to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS value_proposition TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS competitors TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS business_goals TEXT;

-- Business insights table
CREATE TABLE IF NOT EXISTS business_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    insights_json JSONB NOT NULL DEFAULT '{}',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE business_insights ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own insights" ON business_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON business_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON business_insights FOR UPDATE USING (auth.uid() = user_id);
;