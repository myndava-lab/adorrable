
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, testDatabaseConnection } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test endpoint called')
    
    // Test database connection
    const dbTest = await testDatabaseConnection()
    
    if (!dbTest.success) {
      return NextResponse.json({
        error: 'Database connection failed',
        details: dbTest.error
      }, { status: 500 })
    }

    // Test Supabase client creation
    const response = NextResponse.next()
    const supabase = createServerSupabaseClient(request, response)
    
    // Test auth (should work even without user)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Test environment variables
    const envCheck = {
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabase_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      openai_api_key: !!process.env.OPENAI_API_KEY,
      nextauth_secret: !!process.env.NEXTAUTH_SECRET,
      admin_email: !!process.env.ADMIN_EMAIL
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: dbTest.success,
      auth: {
        working: true,
        user: user ? 'authenticated' : 'anonymous',
        error: authError?.message || null
      },
      environment: envCheck
    })

  } catch (error) {
    console.error('❌ Test endpoint error:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
