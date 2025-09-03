-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process payment transaction completion
CREATE OR REPLACE FUNCTION complete_payment_transaction(
  transaction_id UUID,
  provider_ref TEXT,
  provider_response JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_record RECORD;
  package_record RECORD;
  grant_result JSONB;
BEGIN
  -- Get transaction details
  SELECT * INTO transaction_record
  FROM payment_transactions
  WHERE id = transaction_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Transaction not found or already processed'
    );
  END IF;

  -- Get package details
  SELECT * INTO package_record
  FROM price_config
  WHERE package_name = transaction_record.package_name AND active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Package configuration not found'
    );
  END IF;

  -- Grant credits and log
  SELECT grant_credits_and_log(
    transaction_record.profile_id,
    package_record.credits,
    'purchase',
    jsonb_build_object(
      'transaction_id', transaction_id,
      'package_name', transaction_record.package_name,
      'provider', transaction_record.provider,
      'provider_reference', provider_ref
    )
  ) INTO grant_result;

  IF (grant_result->>'success')::boolean = false THEN
    RETURN grant_result;
  END IF;

  -- Update transaction status
  UPDATE payment_transactions
  SET 
    status = 'completed',
    provider_reference = provider_ref,
    provider_response = provider_response,
    credits_granted = package_record.credits,
    updated_at = NOW()
  WHERE id = transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'credits_granted', package_record.credits,
    'new_balance', (grant_result->>'new_balance')::integer
  );
END;
$$;

-- Function to create payment transaction
CREATE OR REPLACE FUNCTION create_payment_transaction(
  p_profile_id UUID,
  p_package_name TEXT,
  p_amount DECIMAL(10,2),
  p_currency TEXT,
  p_provider TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_id UUID;
BEGIN
  -- Verify package exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM price_config 
    WHERE package_name = p_package_name AND active = true
  ) THEN
    RAISE EXCEPTION 'Invalid or inactive package: %', p_package_name;
  END IF;

  -- Create transaction record
  INSERT INTO payment_transactions (
    profile_id,
    package_name,
    amount,
    currency,
    provider,
    status
  ) VALUES (
    p_profile_id,
    p_package_name,
    p_amount,
    p_currency,
    p_provider,
    'pending'
  ) RETURNING id INTO transaction_id;

  RETURN transaction_id;
END;
$$;

-- Function to cancel payment transaction
CREATE OR REPLACE FUNCTION cancel_payment_transaction(
  transaction_id UUID,
  reason TEXT DEFAULT 'cancelled'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE payment_transactions
  SET 
    status = 'failed',
    provider_response = jsonb_build_object('cancellation_reason', reason),
    updated_at = NOW()
  WHERE id = transaction_id AND status = 'pending';

  RETURN FOUND;
END;
$$;

-- Function to get user's transaction history
CREATE OR REPLACE FUNCTION get_user_payment_history(
  user_id UUID,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  package_name TEXT,
  amount DECIMAL(10,2),
  currency TEXT,
  status TEXT,
  provider TEXT,
  credits_granted INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    pt.id,
    pt.package_name,
    pt.amount,
    pt.currency,
    pt.status,
    pt.provider,
    pt.credits_granted,
    pt.created_at
  FROM payment_transactions pt
  WHERE pt.profile_id = user_id
  ORDER BY pt.created_at DESC
  LIMIT limit_count;
$$;

-- Function to get credit transaction summary
CREATE OR REPLACE FUNCTION get_credit_summary(user_id UUID)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'current_balance', COALESCE(p.credits, 0),
    'total_purchased', COALESCE(
      (SELECT SUM(delta) FROM credit_logs cl WHERE cl.profile_id = user_id AND cl.delta > 0), 0
    ),
    'total_spent', COALESCE(
      (SELECT ABS(SUM(delta)) FROM credit_logs cl WHERE cl.profile_id = user_id AND cl.delta < 0), 0
    ),
    'transaction_count', COALESCE(
      (SELECT COUNT(*) FROM credit_logs cl WHERE cl.profile_id = user_id), 0
    )
  )
  FROM profiles p
  WHERE p.id = user_id;
$$;
-- Function to complete payment transaction and grant credits
CREATE OR REPLACE FUNCTION complete_payment_transaction(
  transaction_id TEXT,
  provider_ref TEXT,
  provider_response JSONB
) RETURNS TABLE(success BOOLEAN, credits_granted INTEGER) AS $$
DECLARE
  tx_record payment_transactions;
  credit_success BOOLEAN;
BEGIN
  -- Get transaction record
  SELECT * INTO tx_record FROM payment_transactions WHERE id = transaction_id::UUID;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0;
    RETURN;
  END IF;
  
  -- Update transaction status
  UPDATE payment_transactions 
  SET status = 'completed',
      provider_reference = provider_ref,
      provider_response = provider_response,
      updated_at = NOW()
  WHERE id = transaction_id::UUID;
  
  -- Grant credits
  SELECT grant_credits_and_log(
    tx_record.profile_id,
    tx_record.credits_granted,
    'Payment completed - ' || tx_record.package_name,
    transaction_id
  ) INTO credit_success;
  
  RETURN QUERY SELECT credit_success, tx_record.credits_granted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cancel payment transaction
CREATE OR REPLACE FUNCTION cancel_payment_transaction(
  transaction_id TEXT,
  reason TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE payment_transactions 
  SET status = 'failed',
      provider_response = jsonb_build_object('cancellation_reason', reason),
      updated_at = NOW()
  WHERE id = transaction_id::UUID;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
