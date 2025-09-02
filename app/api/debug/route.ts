
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getUserProfile, grantCredits, deductCredits, testDatabaseConnection } from '@/lib/supabaseServer'
import OpenAI from 'openai'

export async function GET(request: NextRequest) {
  console.log('🔍 Starting debug analysis...')
  
  const debugResults = {
    timestamp: new Date().toISOString(),
    tests: [] as any[]
  }

  try {
    // Test 1: Credits API Debug
    const creditApiTest = {
      name: 'Credits API Debug',
      status: 'pending' as 'pass' | 'fail' | 'pending',
      details: {} as any
    }

    try {
      console.log('🔍 Testing Credits API without auth...')
      
      // Test the credits endpoint without authentication
      const testResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/credits`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const testData = await testResponse.json()
      console.log('Credits API response:', testData)

      creditApiTest.status = testResponse.status === 401 ? 'pass' : 'fail'
      creditApiTest.details = {
        expectedStatus: 401,
        actualStatus: testResponse.status,
        response: testData,
        note: 'Should return 401 for unauthenticated requests'
      }

    } catch (error) {
      console.error('Credits API debug error:', error)
      creditApiTest.status = 'fail'
      creditApiTest.details = {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }
    debugResults.tests.push(creditApiTest)

    // Test 2: AI Generation API Debug
    const aiApiTest = {
      name: 'AI Generation API Debug',
      status: 'pending' as 'pass' | 'fail' | 'pending',
      details: {} as any
    }

    try {
      console.log('🔍 Testing AI Generation API...')
      
      // Test OpenAI connection directly
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not found')
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })

      console.log('Testing OpenAI connection...')
      const testCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 10
      })

      console.log('OpenAI test successful:', testCompletion.choices[0]?.message?.content)

      // Test the AI endpoint without auth
      const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: 'Test prompt',
          userId: 'test-user'
        })
      })

      const aiData = await aiResponse.json()
      console.log('AI API response:', aiData)

      aiApiTest.status = 'pass'
      aiApiTest.details = {
        openaiConnection: 'working',
        apiEndpointStatus: aiResponse.status,
        apiResponse: aiData
      }

    } catch (error) {
      console.error('AI API debug error:', error)
      aiApiTest.status = 'fail'
      aiApiTest.details = {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }
    debugResults.tests.push(aiApiTest)

    // Test 3: Database Schema Debug
    const schemaTest = {
      name: 'Database Schema Debug',
      status: 'pending' as 'pass' | 'fail' | 'pending',
      details: {} as any
    }

    try {
      console.log('🔍 Testing database schema...')
      
      const response = NextResponse.next()
      const supabase = createServerSupabaseClient(request, response)

      // Check if required tables exist
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')

      if (tablesError) {
        throw tablesError
      }

      const tableNames = tables?.map(t => t.table_name) || []
      const requiredTables = ['profiles', 'credit_logs', 'price_config', 'payment_transactions']
      const missingTables = requiredTables.filter(table => !tableNames.includes(table))

      schemaTest.status = missingTables.length === 0 ? 'pass' : 'fail'
      schemaTest.details = {
        existingTables: tableNames,
        requiredTables,
        missingTables,
        allTablesExist: missingTables.length === 0
      }

    } catch (error) {
      console.error('Schema debug error:', error)
      schemaTest.status = 'fail'
      schemaTest.details = {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
    debugResults.tests.push(schemaTest)

    // Test 4: Environment Variables Detailed Check
    const envTest = {
      name: 'Environment Variables Detailed',
      status: 'pass' as 'pass' | 'fail' | 'pending',
      details: {
        NEXT_PUBLIC_SUPABASE_URL: {
          exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          value: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'
        },
        NEXT_PUBLIC_SUPABASE_ANON_KEY: {
          exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
        },
        SUPABASE_SERVICE_ROLE_KEY: {
          exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          value: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing'
        },
        OPENAI_API_KEY: {
          exists: !!process.env.OPENAI_API_KEY,
          value: process.env.OPENAI_API_KEY ? 'Set' : 'Missing'
        },
        NEXTAUTH_SECRET: {
          exists: !!process.env.NEXTAUTH_SECRET,
          value: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing'
        },
        ADMIN_EMAIL: {
          exists: !!process.env.ADMIN_EMAIL,
          value: process.env.ADMIN_EMAIL ? 'Set' : 'Missing'
        }
      }
    }
    debugResults.tests.push(envTest)

    console.log('🎯 Debug Results:', debugResults)
    return NextResponse.json(debugResults)

  } catch (error) {
    console.error('❌ Debug endpoint error:', error)
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
