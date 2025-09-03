
-- Complete database setup for Adorrable.dev
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create system_config table first (required by other functions)
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create waiting_list table
CREATE TABLE IF NOT EXISTS waiting_list (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'
);

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  credits INTEGER DEFAULT 4 NOT NULL,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  payment_tier TEXT DEFAULT 'free' CHECK (payment_tier IN ('free', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit logs table for audit trail
CREATE TABLE IF NOT EXISTS credit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  transaction_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price configuration table
CREATE TABLE IF NOT EXISTS price_config (
  id BIGSERIAL PRIMARY KEY,
  package_name TEXT NOT NULL UNIQUE,
  credits INT NOT NULL,
  price_usd DECIMAL(10,2) NOT NULL,
  price_ngn DECIMAL(10,2),
  popular BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize system config with beta limits
INSERT INTO system_config (key, value) VALUES
  ('max_beta_users', '100'),
  ('daily_signup_limit', '100')
ON CONFLICT (key) DO NOTHING;

-- Insert default pricing
INSERT INTO price_config (package_name, credits, price_usd, price_ngn) VALUES
  ('Starter', 50, 9.99, 15000),
  ('Creator', 200, 29.99, 45000),
  ('Business', 500, 59.99, 90000),
  ('Enterprise', 1000, 99.99, 150000)
ON CONFLICT (package_name) DO NOTHING;

-- Function to get beta user stats (the missing function causing errors)
CREATE OR REPLACE FUNCTION public.get_beta_stats()
RETURNS JSON AS $$
DECLARE
  max_users INTEGER;
  current_free_users INTEGER;
  total_users INTEGER;
  waiting_count INTEGER;
  result JSON;
BEGIN
  -- Get max users from system_config, default to 100 if not found
  SELECT COALESCE(value::INTEGER, 100) INTO max_users 
  FROM system_config 
  WHERE key = 'max_beta_users'
  LIMIT 1;
  
  IF max_users IS NULL THEN
    max_users := 100;
  END IF;
  
  -- Get current free users only (paid users don't count towards limit)
  SELECT COUNT(*) INTO current_free_users 
  FROM profiles 
  WHERE payment_tier = 'free' AND (credits > 0 OR created_at > NOW() - INTERVAL '30 days');
  
  IF current_free_users IS NULL THEN
    current_free_users := 0;
  END IF;
  
  -- Get total users for stats
  SELECT COUNT(*) INTO total_users 
  FROM profiles;
  
  IF total_users IS NULL THEN
    total_users := 0;
  END IF;
  
  -- Get waiting list count
  SELECT COUNT(*) INTO waiting_count 
  FROM waiting_list;
  
  IF waiting_count IS NULL THEN
    waiting_count := 0;
  END IF;
  
  SELECT json_build_object(
    'max_users', max_users,
    'current_free_users', current_free_users,
    'total_users', total_users,
    'spots_remaining', GREATEST(0, max_users - current_free_users),
    'waiting_list_count', waiting_count,
    'is_beta_full', current_free_users >= max_users
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_beta_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.get_beta_stats() TO authenticated;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiting_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own credit logs" ON credit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active pricing" ON price_config FOR SELECT USING (active = true);
CREATE POLICY "Users can view own waiting list entry" ON waiting_list FOR SELECT USING (email = auth.jwt()->>'email');

-- Function to grant credits and log transaction
CREATE OR REPLACE FUNCTION grant_credits_and_log(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_transaction_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update user credits
  UPDATE profiles 
  SET credits = credits + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log the transaction
  INSERT INTO credit_logs (user_id, amount, reason, transaction_id, metadata)
  VALUES (p_user_id, p_amount, p_reason, p_transaction_id, p_metadata);
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct credits
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Check current credits
  SELECT credits INTO current_credits FROM profiles WHERE id = p_user_id;
  
  IF current_credits < p_amount THEN
    RETURN FALSE; -- Insufficient credits
  END IF;
  
  -- Deduct credits and log
  PERFORM grant_credits_and_log(p_user_id, -p_amount, p_reason);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_config_updated_at BEFORE UPDATE ON price_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
