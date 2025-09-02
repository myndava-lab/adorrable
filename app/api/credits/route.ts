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
      .select('credits')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      // If profile not found, consider creating it or returning an error
      // For now, returning an error as per the edited snippet's logic
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      credits: profile.credits,
      tier: 'free'
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

    // Get current credits from the profile, create if doesn't exist
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          credits: 4 // Default credits
        })
        .select('credits')
        .single()

      if (createError) {
        console.error('Error creating profile:', createError)
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }
      profile = newProfile
    } else if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json({ error: 'Profile error' }, { status: 500 })
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
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating credits:', updateError)
      return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 })
    }

    // Log the transaction in the credit_logs table
    const { error: logError } = await supabase
      .from('credit_logs')
      .insert({
        profile_id: user.id,
        delta: action === 'deduct' ? -amount : amount,
        reason: reason || `Credits ${action}`,
        meta: meta || {}
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