import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
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

    const { data: betaStats, error } = await supabase
      .rpc('get_beta_stats')

    if (error) {
      console.error('Error fetching beta stats:', error)
      return NextResponse.json(
        { error: 'Failed to fetch beta statistics' },
        { status: 500 }
      )
    }

    return NextResponse.json(betaStats)
  } catch (error) {
    console.error('Beta stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}