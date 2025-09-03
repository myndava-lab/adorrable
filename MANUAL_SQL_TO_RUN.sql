
-- Create the get_beta_stats function directly
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
    
    -- Get total credits used (assuming credits start at 4 and decrease)
    SELECT COALESCE(SUM(4 - credits), 0) INTO total_credits_used
    FROM profiles
    WHERE credits < 4;
    
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
EXCEPTION
    WHEN OTHERS THEN
        -- Return safe defaults on any error
        RETURN json_build_object(
            'total_users', 0,
            'active_users', 0,
            'total_credits_used', 0,
            'avg_credits_per_user', 0,
            'beta_slots_remaining', 100
        );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_beta_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_beta_stats() TO anon;
