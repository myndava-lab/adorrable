import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper function to create a user profile (kept from original for potential future use or context, though not directly called in the new GET/POST)
async function createUserProfile(userId: string, email: string, displayName: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        display_name: displayName,
        credits: 4 // Default credits for new users
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Exception creating user profile:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    // Use the unified Supabase client for authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user profile with credits and subscription tier
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits, subscription_tier')
      // Assuming 'user_id' is the correct column name in the profiles table for linking to auth users
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      // If profile not found, consider creating it or returning an error
      // For now, returning an error as per the edited snippet's logic
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      credits: profile.credits,
      tier: profile.subscription_tier || 'free'
    })

  } catch (error) {
    console.error('Credits GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    // Use the unified Supabase client for authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { action, amount, reason, meta } = await request.json()

    // Basic validation for action and amount
    if (!action || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid action or amount' }, { status: 400 })
    }

    // Get current credits from the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      // Assuming 'user_id' is the correct column name in the profiles table for linking to auth users
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    let newBalance = profile.credits

    if (action === 'grant') {
      newBalance += amount
    } else if (action === 'deduct') {
      // Check for sufficient credits before deduction
      if (profile.credits < amount) {
        return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 })
      }
      newBalance -= amount
    } else {
      // Handle invalid action type
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update credits in the profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: newBalance })
      .eq('user_id', user.id) // Assuming 'user_id' is the correct column

    if (updateError) {
      console.error('Error updating credits:', updateError)
      return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 })
    }

    // Log the transaction in the credit_transactions table
    const { error: logError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: action === 'deduct' ? -amount : amount, // Store deduction as negative
        type: action,
        description: reason || `Credits ${action}`, // Use provided reason or a default description
        metadata: meta || {} // Store any additional metadata
      })

    if (logError) {
      console.error('Error logging transaction:', logError)
      // This is a non-critical error, so we don't fail the entire request
    }

    // Return success response with updated balance information
    return NextResponse.json({
      success: true,
      action,
      amount,
      newBalance,
      previousBalance: profile.credits
    })

  } catch (error) {
    console.error('Credits POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}