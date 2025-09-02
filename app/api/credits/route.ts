import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUserProfile, grantCredits, deductCredits, getCreditLogs } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, we'll use a mock user ID in proper UUID format
    // In production, you'd extract this from the JWT token
    const mockUserId = '550e8400-e29b-41d4-a716-446655440000'

    // Get user profile with current credits
    const profile = await getUserProfile(mockUserId)

    if (!profile) {
      // Create demo user if doesn't exist
      const newProfile = await supabaseAdmin
        .from('profiles')
        .insert({
          id: mockUserId,
          email: 'demo@adorrable.dev',
          display_name: 'Demo User',
          credits: 4
        })
        .select()
        .single()

      if (newProfile.error) {
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        credits: newProfile.data.credits,
        profile: newProfile.data
      })
    }

    // Get recent credit logs
    const logs = await getCreditLogs(mockUserId, 10)

    return NextResponse.json({
      success: true,
      credits: profile.credits,
      profile,
      recent_logs: logs
    })
  } catch (error) {
    console.error('Credits GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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

    // For demo purposes, we'll use a mock user ID
    // In production, you'd extract this from the JWT token
    const mockUserId = '550e8400-e29b-41d4-a716-446655440000'

    let result

    if (action === 'grant') {
      result = await grantCredits(mockUserId, amount, reason, meta)
    } else if (action === 'deduct') {
      result = await deductCredits(mockUserId, amount, reason, meta)
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