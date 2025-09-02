
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, testDatabaseConnection, getUserProfile } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting comprehensive debug analysis...')
    
    const debugResults = {
      timestamp: new Date().toISOString(),
      tests: [] as Array<{
        name: string
        status: 'pass' | 'fail' | 'pending'
        details: any
        error?: string
      }>
    }

    // Test 1: Credits API
    try {
      console.log('Testing Credits API...')
      const creditsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/credits`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const creditsData = await creditsResponse.text()
      console.log('Credits API raw response:', creditsData)
      
      let parsedCreditsData = null
      try {
        parsedCreditsData = JSON.parse(creditsData)
      } catch (parseError) {
        console.error('Credits API JSON parse error:', parseError)
      }

      debugResults.tests.push({
        name: 'Credits API Debug',
        status: creditsResponse.ok ? 'pass' : 'fail',
        details: {
          statusCode: creditsResponse.status,
          statusText: creditsResponse.statusText,
          rawResponse: creditsData,
          parsedResponse: parsedCreditsData,
          headers: Object.fromEntries(creditsResponse.headers.entries())
        },
        error: !creditsResponse.ok ? `HTTP ${creditsResponse.status}` : undefined
      })
    } catch (error) {
      debugResults.tests.push({
        name: 'Credits API Debug',
        status: 'fail',
        details: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 2: AI Generation API
    try {
      console.log('Testing AI Generation API...')
      const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/ai/generate`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const aiData = await aiResponse.text()
      console.log('AI API raw response:', aiData)
      
      let parsedAiData = null
      try {
        parsedAiData = JSON.parse(aiData)
      } catch (parseError) {
        console.error('AI API JSON parse error:', parseError)
      }

      debugResults.tests.push({
        name: 'AI Generation API Debug',
        status: aiResponse.ok ? 'pass' : 'fail',
        details: {
          statusCode: aiResponse.status,
          statusText: aiResponse.statusText,
          rawResponse: aiData,
          parsedResponse: parsedAiData,
          openaiConfigured: !!process.env.OPENAI_API_KEY,
          headers: Object.fromEntries(aiResponse.headers.entries())
        },
        error: !aiResponse.ok ? `HTTP ${aiResponse.status}` : undefined
      })
    } catch (error) {
      debugResults.tests.push({
        name: 'AI Generation API Debug',
        status: 'fail',
        details: {
          openaiConfigured: !!process.env.OPENAI_API_KEY
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 3: Database Schema
    try {
      console.log('Testing Database Schema...')
      const response = NextResponse.next()
      const supabase = createServerSupabaseClient(request, response)
      
      // Check if tables exist
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')

      debugResults.tests.push({
        name: 'Database Schema Debug',
        status: tablesError ? 'fail' : 'pass',
        details: {
          tables: tables?.map(t => t.table_name) || [],
          tablesCount: tables?.length || 0,
          requiredTables: ['users', 'profiles', 'credit_transactions'],
          hasRequiredTables: tables?.some(t => ['users', 'profiles', 'credit_transactions'].includes(t.table_name))
        },
        error: tablesError?.message
      })
    } catch (error) {
      debugResults.tests.push({
        name: 'Database Schema Debug',
        status: 'fail',
        details: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 4: Environment Variables
    const envTest = {
      name: 'Environment Variables Detailed',
      status: 'pass' as 'pass' | 'fail' | 'pending',
      details: {
        NEXT_PUBLIC_SUPABASE_URL: {
          exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          value: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'
        },
        NEXT_PUBLIC_SUPABASE_ANON_KEY: {
          exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌'
        },
        SUPABASE_SERVICE_ROLE_KEY: {
          exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          value: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌'
        },
        OPENAI_API_KEY: {
          exists: !!process.env.OPENAI_API_KEY,
          value: process.env.OPENAI_API_KEY ? '✅' : '❌'
        },
        NEXTAUTH_SECRET: {
          exists: !!process.env.NEXTAUTH_SECRET,
          value: process.env.NEXTAUTH_SECRET ? '✅' : '❌'
        },
        ADMIN_EMAIL: {
          exists: !!process.env.ADMIN_EMAIL,
          value: process.env.ADMIN_EMAIL ? '✅' : '❌'
        }
      }
    }
    debugResults.tests.push(envTest)

    console.log('🎯 Debug Results:', debugResults)
    return NextResponse.json(debugResults)

  } catch (error) {
    console.error('❌ Debug endpoint error:', error)
    return NextResponse.json({
      error: 'Debug analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
