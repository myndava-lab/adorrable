
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'

export async function GET() {
  try {
    // Simple query to test database connection
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .limit(1)

    if (error) {
      console.error('Health check failed:', error)
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Database connection failed',
          error: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        error: error.message 
      },
      { status: 500 }
    )
  }
}
