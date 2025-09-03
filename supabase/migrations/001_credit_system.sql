
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  credits INTEGER DEFAULT 4 NOT NULL,  -- 4 welcome credits
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  payment_tier TEXT DEFAULT 'free' CHECK (payment_tier IN ('free', 'paid')), -- Track if user paid to bypass beta limit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit logs table for audit trail
CREATE TABLE IF NOT EXISTS credit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- positive for credits added, negative for credits spent
  reason TEXT NOT NULL,
  transaction_id TEXT, -- payment transaction reference
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

-- Waiting list table for beta overflow
CREATE TABLE IF NOT EXISTS waiting_list (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'
);

-- System configuration table
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own credit logs" ON credit_logs;
DROP POLICY IF EXISTS "Anyone can view active pricing" ON price_config;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Credit logs policies  
CREATE POLICY "Users can view own credit logs" ON credit_logs FOR SELECT USING (auth.uid() = user_id);

-- Price config policies
CREATE POLICY "Anyone can view active pricing" ON price_config FOR SELECT USING (active = true);

-- Waiting list policies
ALTER TABLE waiting_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own waiting list entry" ON waiting_list FOR SELECT USING (email = auth.jwt()->>'email');

-- System config policies (admin only)
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Functions to manage waiting list
CREATE OR REPLACE FUNCTION add_to_waiting_list(
  p_email TEXT,
  p_full_name TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  entry_id UUID;
BEGIN
  INSERT INTO waiting_list (email, full_name, metadata)
  VALUES (p_email, p_full_name, jsonb_build_object('added_date', NOW()))
  RETURNING id INTO entry_id;
  
  RETURN entry_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get beta user stats
CREATE OR REPLACE FUNCTION get_beta_stats()
RETURNS JSON AS $$
DECLARE
  max_users INTEGER;
  current_free_users INTEGER;
  total_users INTEGER;
  waiting_count INTEGER;
  result JSON;
BEGIN
  -- Get max users
  SELECT value::INTEGER INTO max_users 
  FROM system_config 
  WHERE key = 'max_beta_users';
  
  -- Get current free users only (paid users don't count towards limit)
  SELECT COUNT(*) INTO current_free_users 
  FROM profiles 
  WHERE payment_tier = 'free' AND (credits > 0 OR created_at > NOW() - INTERVAL '30 days');
  
  -- Get total users for stats
  SELECT COUNT(*) INTO total_users 
  FROM profiles;
  
  -- Get waiting list count
  SELECT COUNT(*) INTO waiting_count 
  FROM waiting_list;
  
  SELECT json_build_object(
    'max_users', COALESCE(max_users, 100),
    'current_free_users', COALESCE(current_free_users, 0),
    'total_users', COALESCE(total_users, 0),
    'spots_remaining', GREATEST(0, COALESCE(max_users, 100) - COALESCE(current_free_users, 0)),
    'waiting_list_count', COALESCE(waiting_count, 0),
    'is_beta_full', COALESCE(current_free_users, 0) >= COALESCE(max_users, 100)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_config_updated_at BEFORE UPDATE ON price_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check if we can accept new beta users (free users only)
CREATE OR REPLACE FUNCTION can_accept_beta_user(p_payment_tier TEXT DEFAULT 'free')
RETURNS BOOLEAN AS $$
DECLARE
  max_users INTEGER;
  current_free_users INTEGER;
BEGIN
  -- Paid users always bypass the limit
  IF p_payment_tier = 'paid' THEN
    RETURN TRUE;
  END IF;
  
  -- Get max beta users from config
  SELECT value::INTEGER INTO max_users 
  FROM system_config 
  WHERE key = 'max_beta_users';
  
  IF max_users IS NULL THEN
    max_users := 100; -- Default fallback
  END IF;
  
  -- Count current free users only
  SELECT COUNT(*) INTO current_free_users 
  FROM profiles 
  WHERE payment_tier = 'free' AND created_at IS NOT NULL;
  
  RETURN current_free_users < max_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user signup with beta limits
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  can_join BOOLEAN;
  user_payment_tier TEXT;
BEGIN
  -- Get payment tier from user metadata (default to free)
  user_payment_tier := COALESCE(NEW.raw_user_meta_data->>'payment_tier', 'free');
  
  -- Check if we can accept this user
  SELECT can_accept_beta_user(user_payment_tier) INTO can_join;
  
  IF can_join THEN
    -- Create profile with welcome credits
    INSERT INTO profiles (id, email, credits, payment_tier)
    VALUES (
      NEW.id,
      NEW.email,
      CASE WHEN user_payment_tier = 'paid' THEN 50 ELSE 4 END,  -- Paid users get more credits
      user_payment_tier
    );
    
    -- Log the welcome credits
    INSERT INTO credit_logs (user_id, amount, reason, metadata)
    VALUES (
      NEW.id,
      4,
      'Welcome credits - new user signup',
      jsonb_build_object('signup_date', NOW(), 'beta_user', true)
    );
  ELSE
    -- User exceeds beta limit, they should be on waiting list
    -- We still create the profile but with 0 credits and waiting status
    INSERT INTO profiles (id, email, credits, payment_tier)
    VALUES (
      NEW.id,
      NEW.email,
      0,  -- No credits for waiting list users
      user_payment_tier
    );
    
    -- Log them as waiting list
    INSERT INTO credit_logs (user_id, amount, reason, metadata)
    VALUES (
      NEW.id,
      0,
      'Waiting list - beta limit reached',
      jsonb_build_object('signup_date', NOW(), 'waiting_list', true)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile with welcome credits
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
