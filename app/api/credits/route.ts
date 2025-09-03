import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getUserProfile, grantCredits, deductCredits } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.next()
    const supabase = createServerSupabaseClient(request, response)

    // Check if this is a test request
    const url = new URL(request.url)
    const isTest = url.searchParams.get('test') === 'true'

    if (isTest) {
      return NextResponse.json({ 
        message: 'Credits API is working',
        test_mode: true,
        endpoints: ['GET', 'POST'],
        timestamp: new Date().toISOString()
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, credits, subscription_tier, created_at')
      .eq('id', user.id)
      .single()

    if (profileError) {
      // If profile doesn't exist, try to create it with welcome credits
      if (profileError.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            credits: 4,  // 4 welcome credits
            full_name: user.user_metadata?.full_name || null
          })
          .select('id, email, credits, subscription_tier, created_at')
          .single()

        if (createError) {
          console.error('Profile creation error:', createError)
          return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
        }

        // Log the welcome credits
        await supabase
          .from('credit_logs')
          .insert({
            user_id: user.id,
            amount: 4,
            reason: 'Welcome credits - new user signup',
            metadata: { signup_date: new Date().toISOString() }
          })

        return NextResponse.json({
          success: true,
          profile: newProfile,
          message: 'Welcome! You have received 4 free credits.'
        })
      }

      console.error('Profile fetch error:', profileError)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      credits: profile.credits,
      userId: user.id 
    })

  } catch (error) {
    console.error('Credits API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.next()
    const supabase = createServerSupabaseClient(request, response)

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, amount } = body

    if (!action || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid action or amount' }, { status: 400 })
    }

    let result
    if (action === 'grant') {
      result = await grantCredits(user.id, amount, 'Test grant')
    } else if (action === 'deduct') {
      result = await deductCredits(user.id, amount, 'Test deduction')
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true,
      newCredits: result.newCredits
    })

  } catch (error) {
    console.error('Credits POST API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}