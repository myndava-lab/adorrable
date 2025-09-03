
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, fullName } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Add to waiting list
    const { data, error } = await supabase
      .rpc('add_to_waiting_list', {
        p_email: email,
        p_full_name: fullName || null
      })

    if (error) {
      if (error.message?.includes('duplicate key')) {
        return NextResponse.json({
          success: true,
          message: 'You\'re already on our waiting list! We\'ll email you when a spot opens up.',
          alreadyExists: true
        })
      }
      
      console.error('Waiting list error:', error)
      return NextResponse.json(
        { error: 'Failed to join waiting list' },
        { status: 500 }
      )
    }

    // Get updated stats
    const { data: betaStats } = await supabase.rpc('get_beta_stats')

    return NextResponse.json({
      success: true,
      message: `🎉 You're on the waiting list! You're #${betaStats?.waiting_list_count || 1} in line. We'll email you when a spot opens up!`,
      waitingListId: data,
      position: betaStats?.waiting_list_count || 1
    })

  } catch (error) {
    console.error('Waiting list API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: betaStats, error } = await supabase.rpc('get_beta_stats')

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch stats' },
        { status: 500 }
      )
    }

    return NextResponse.json(betaStats)
  } catch (error) {
    console.error('Beta stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
