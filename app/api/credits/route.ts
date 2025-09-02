import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUserProfile, grantCredits, deductCredits, getCreditLogs } from '@/lib/supabaseServer'

// Helper function to create a user profile
async function createUserProfile(userId: string, email: string, displayName: string): Promise<any | null> {
  try {
    const { data, error } = await supabaseAdmin
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

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let profile = await getUserProfile(user.id)
    
    // Create profile if it doesn't exist
    if (!profile) {
      profile = await createUserProfile(
        user.id, 
        user.email || '', 
        user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
      )
    }

    if (!profile) {
      return NextResponse.json({ error: 'Failed to create or fetch profile' }, { status: 500 })
    }

    // Get recent credit logs
    const logs = await getCreditLogs(user.id, 10)

    return NextResponse.json({
      profile,
      logs
    })

  } catch (error) {
    console.error('Error in credits API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

    // If no profile exists, create one
    if (!profile) {
      console.log('Creating new profile for user:', user.id)
      profile = await createUserProfile(
        user.id,
        user.email || '',
        user.user_metadata?.display_name || user.email?.split('@')[0]
      )

      if (!profile) {
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }
    }

    return NextResponse.json({
      credits: profile.credits,
      email: profile.email,
      display_name: profile.display_name
    })
  } catch (error) {
    console.error('Error fetching user credits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, amount, reason, meta = {} } = body

    // Validate input
    if (!action || !amount || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: action, amount, reason' },
        { status: 400 }
      )
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let result

    if (action === 'grant') {
      result = await grantCredits(user.id, amount, reason, meta)
    } else if (action === 'deduct') {
      result = await deductCredits(user.id, amount, reason, meta)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "grant" or "deduct"' },
        { status: 400 }
      )
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      newBalance: result.newBalance,
      action,
      amount: action === 'deduct' ? -amount : amount,
      reason
    })
  } catch (error) {
    console.error('Credits POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Admin endpoint to manually adjust credits
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, credits, reason = 'admin_adjustment' } = body

    // In production, verify admin permissions here
    const adminKey = request.headers.get('x-admin-key')
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!userId || typeof credits !== 'number') {
      return NextResponse.json(
        { error: 'Missing userId or invalid credits value' },
        { status: 400 }
      )
    }

    // Get current profile
    const profile = await getUserProfile(userId)
    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate delta
    const delta = credits - profile.credits

    let result
    if (delta > 0) {
      result = await grantCredits(userId, delta, reason, { admin_action: true })
    } else if (delta < 0) {
      result = await deductCredits(userId, Math.abs(delta), reason, { admin_action: true })
    } else {
      return NextResponse.json({
        success: true,
        message: 'No change needed',
        currentBalance: profile.credits
      })
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      oldBalance: profile.credits,
      newBalance: result.newBalance,
      delta,
      reason
    })
  } catch (error) {
    console.error('Credits PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Credits API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
