
-- Function to increment user credits safely
CREATE OR REPLACE FUNCTION increment_user_credits(user_id UUID, credit_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET 
    credits = credits + credit_amount,
    updated_at = NOW()
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found: %', user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to safely deduct credits
CREATE OR REPLACE FUNCTION deduct_user_credits(user_id UUID, credit_amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  SELECT credits INTO current_credits 
  FROM profiles 
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found: %', user_id;
  END IF;
  
  IF current_credits < credit_amount THEN
    RETURN FALSE; -- Insufficient credits
  END IF;
  
  UPDATE profiles 
  SET 
    credits = credits - credit_amount,
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get user credits safely
CREATE OR REPLACE FUNCTION get_user_credits(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  user_credits INTEGER;
BEGIN
  SELECT credits INTO user_credits 
  FROM profiles 
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  RETURN COALESCE(user_credits, 0);
END;
$$ LANGUAGE plpgsql;
