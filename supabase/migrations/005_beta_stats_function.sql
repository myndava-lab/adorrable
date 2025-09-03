
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the get_beta_stats function
CREATE OR REPLACE FUNCTION public.get_beta_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_users integer;
    active_users integer;
    total_credits_used integer;
    avg_credits_per_user numeric;
    result json;
BEGIN
    -- Get total registered users
    SELECT COUNT(*) INTO total_users
    FROM auth.users;
    
    -- Get active users (users with profiles)
    SELECT COUNT(*) INTO active_users
    FROM profiles;
    
    -- Get total credits used (assuming credits start at 5 and decrease)
    SELECT COALESCE(SUM(5 - credits), 0) INTO total_credits_used
    FROM profiles
    WHERE credits < 5;
    
    -- Calculate average credits per user
    SELECT COALESCE(AVG(credits), 0) INTO avg_credits_per_user
    FROM profiles;
    
    -- Build result JSON
    result := json_build_object(
        'total_users', COALESCE(total_users, 0),
        'active_users', COALESCE(active_users, 0),
        'total_credits_used', COALESCE(total_credits_used, 0),
        'avg_credits_per_user', COALESCE(avg_credits_per_user, 0),
        'beta_slots_remaining', GREATEST(0, 100 - COALESCE(active_users, 0))
    );
    
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_beta_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_beta_stats() TO anon;
