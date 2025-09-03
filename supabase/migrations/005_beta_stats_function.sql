
-- Create get_beta_stats function
CREATE OR REPLACE FUNCTION get_beta_stats()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'total_users', COALESCE((SELECT COUNT(*) FROM profiles), 0),
    'premium_users', COALESCE((SELECT COUNT(*) FROM profiles WHERE is_premium = true), 0),
    'total_credits_used', COALESCE((SELECT SUM(amount) FROM credit_transactions WHERE amount < 0), 0),
    'active_beta_slots', GREATEST(0, 100 - COALESCE((SELECT COUNT(*) FROM profiles), 0))
  );
$$;
