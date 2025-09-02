import { NextResponse } from 'next/server'
import { testDatabaseConnection } from '@/lib/supabaseServer'

export async function GET() {
  try {
    const isConnected = await testDatabaseConnection()

    // Check environment variables
    const envChecks = {
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabase_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      openai_api_key: !!process.env.OPENAI_API_KEY,
      nextauth_secret: !!process.env.NEXTAUTH_SECRET,
      admin_email: !!process.env.ADMIN_EMAIL
    }

    if (!isConnected) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Database connection failed',
        environment: envChecks,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    return NextResponse.json({ 
      status: 'ok', 
      message: 'Database connected successfully',
      environment: envChecks,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}