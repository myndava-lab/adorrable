
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, packageName = 'Starter' } = await request.json()

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

    // Get pricing info for the package
    const { data: pricing, error: pricingError } = await supabase
      .from('price_config')
      .select('*')
      .eq('package_name', packageName)
      .eq('active', true)
      .single()

    if (pricingError || !pricing) {
      return NextResponse.json(
        { error: 'Invalid package selected' },
        { status: 400 }
      )
    }

    // Sign up the user with paid tier
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
          payment_tier: 'paid',
          selected_package: packageName
        }
      }
    })

    if (authError) {
      console.error('Premium signup error:', authError)
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

    // Get updated beta stats
    const { data: betaStats } = await supabase.rpc('get_beta_stats')

    return NextResponse.json({
      success: true,
      user: authData.user,
      requiresPayment: true,
      selectedPackage: packageName,
      pricing: pricing,
      message: `🎉 Premium account created! Please complete payment for your ${packageName} package to activate your account with ${pricing.credits} credits.`,
      betaStats
    })

  } catch (error) {
    console.error('Premium signup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
