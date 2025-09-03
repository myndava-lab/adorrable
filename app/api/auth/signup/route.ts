
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, paymentTier = 'free' } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    // Check beta limits first
    const { data: betaStats, error: statsError } = await supabase
      .rpc('get_beta_stats')

    if (statsError) {
      console.error('Error checking beta stats:', statsError)
      return NextResponse.json(
        { error: 'System temporarily unavailable' },
        { status: 503 }
      )
    }

    // Check if beta is full for free users only
    // Paid users can bypass the 100 user limit
    if (betaStats?.is_beta_full && paymentTier === 'free') {
      const { error: waitingListError } = await supabase
        .rpc('add_to_waiting_list', {
          p_email: email,
          p_full_name: fullName || null
        })

      if (waitingListError) {
        console.error('Error adding to waiting list:', waitingListError)
        return NextResponse.json(
          { error: 'Failed to join waiting list' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: false,
        waitingList: true,
        message: `🎉 You're on the waiting list! We've reached our beta limit of ${betaStats.max_users} free users. You're #${betaStats.waiting_list_count + 1} in line. We'll email you when a spot opens up! Or upgrade to Premium to skip the line.`,
        stats: betaStats
      })
    }

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
          payment_tier: paymentTier
        }
      }
    })

    if (authError) {
      console.error('Signup error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 400 }
      )
    }

    // The profile should be automatically created by the database trigger
    // But let's verify it exists and has the correct credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile verification error:', profileError)
    }

    const welcomeCredits = paymentTier === 'paid' ? 50 : 4;
    const userType = paymentTier === 'paid' ? 'Premium' : 'Free';
    
    return NextResponse.json({
      success: true,
      user: authData.user,
      profile: profile,
      betaStats,
      message: authData.user.email_confirmed_at 
        ? `🎉 Welcome to Adorrable Beta as a ${userType} user! You received ${welcomeCredits} welcome credits.` 
        : `Please check your email to confirm your account. You'll receive ${welcomeCredits} welcome credits as a ${userType} user upon confirmation.`
    })

  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
