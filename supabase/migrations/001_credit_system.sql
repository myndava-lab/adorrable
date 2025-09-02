
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  credits INTEGER DEFAULT 0 NOT NULL,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
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

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Credit logs policies  
CREATE POLICY "Users can view own credit logs" ON credit_logs FOR SELECT USING (auth.uid() = user_id);

-- Price config policies
CREATE POLICY "Anyone can view active pricing" ON price_config FOR SELECT USING (is_active = true);

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
