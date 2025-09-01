
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  try {
    // Check database connection
    const { data, error } = await supabaseServer
      .from('price_config')
      .select('id')
      .limit(1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'operational'
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed'
      },
      { status: 503 }
    )
  }
}
