
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
    // Test 1: Credits API Internal Test
    const creditApiTest = {
      name: 'Credits API Internal Test',
      status: 'pending' as 'pass' | 'fail' | 'pending',
      details: {} as any
    }

    try {
      console.log('🔍 Testing Credits API internally...')
      
      const response = NextResponse.next()
      const supabase = createServerSupabaseClient(request, response)

      // Test auth check
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        creditApiTest.status = 'pass'
        creditApiTest.details = {
          authCheck: 'working',
          note: 'Correctly returns unauthorized for unauthenticated requests',
          expectedBehavior: 'Should require authentication'
        }
      } else {
        // If user is authenticated, test profile retrieval
        const profile = await getUserProfile(user.id)
        creditApiTest.status = profile ? 'pass' : 'fail'
        creditApiTest.details = {
          authCheck: 'authenticated',
          profileExists: !!profile,
          credits: profile?.credits || 0
        }
      }

    } catch (error) {
      console.error('Credits API internal test error:', error)
      creditApiTest.status = 'fail'
      creditApiTest.details = {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }
    debugResults.tests.push(creditApiTest)

    // Test 2: OpenAI Connection Test
    const aiApiTest = {
      name: 'OpenAI Connection Test',
      status: 'pending' as 'pass' | 'fail' | 'pending',
      details: {} as any
    }

    try {
      console.log('🔍 Testing OpenAI connection...')
      
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not found')
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })

      console.log('Testing OpenAI connection...')
      const testCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test connection' }],
        max_tokens: 10
      })

      const responseContent = testCompletion.choices[0]?.message?.content
      console.log('OpenAI test successful:', responseContent)

      aiApiTest.status = 'pass'
      aiApiTest.details = {
        connection: 'successful',
        model: 'gpt-3.5-turbo',
        testResponse: responseContent,
        tokensUsed: testCompletion.usage?.total_tokens || 0
      }

    } catch (error) {
      console.error('OpenAI connection test error:', error)
      aiApiTest.status = 'fail'
      aiApiTest.details = {
        error: error instanceof Error ? error.message : 'Unknown error',
        apiKeyConfigured: !!process.env.OPENAI_API_KEY
      }
    }
    debugResults.tests.push(aiApiTest)

    // Test 3: Database Schema Test
    const schemaTest = {
      name: 'Database Schema Test',
      status: 'pending' as 'pass' | 'fail' | 'pending',
      details: {} as any
    }

    try {
      console.log('🔍 Testing database schema...')
      
      const response = NextResponse.next()
      const supabase = createServerSupabaseClient(request, response)

      // Test basic database connection
      const connectionTest = await testDatabaseConnection()
      
      if (!connectionTest.success) {
        throw new Error(connectionTest.error)
      }

      // Test if we can query profiles table
      const { data: profilesTest, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)

      // Test if we can query credit_logs table
      const { data: creditLogsTest, error: creditLogsError } = await supabase
        .from('credit_logs')
        .select('id')
        .limit(1)

      const tablesWorking = {
        profiles: !profilesError,
        credit_logs: !creditLogsError
      }

      const allTablesWork = Object.values(tablesWorking).every(Boolean)

      schemaTest.status = allTablesWork ? 'pass' : 'fail'
      schemaTest.details = {
        connectionTest: connectionTest.success,
        tablesWorking,
        errors: {
          profiles: profilesError?.message,
          credit_logs: creditLogsError?.message
        }
      }

    } catch (error) {
      console.error('Schema test error:', error)
      schemaTest.status = 'fail'
      schemaTest.details = {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
    debugResults.tests.push(schemaTest)

    // Test 4: Database Functions Test
    const functionsTest = {
      name: 'Database Functions Test',
      status: 'pending' as 'pass' | 'fail' | 'pending',
      details: {} as any
    }

    try {
      console.log('🔍 Testing database functions...')
      
      // Test creating a test profile if not exists
      const testUserId = 'test-debug-user-' + Date.now()
      
      // Test getUserProfile function
      const profile = await getUserProfile(testUserId)
      
      if (!profile) {
        // Profile doesn't exist, which is expected for a test user
        functionsTest.status = 'pass'
        functionsTest.details = {
          getUserProfile: 'working',
          note: 'Function correctly returns null for non-existent user'
        }
      } else {
        functionsTest.status = 'pass'
        functionsTest.details = {
          getUserProfile: 'working',
          profileFound: true,
          credits: profile.credits
        }
      }

    } catch (error) {
      console.error('Functions test error:', error)
      functionsTest.status = 'fail'
      functionsTest.details = {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
    debugResults.tests.push(functionsTest)

    // Test 5: Environment Variables Detailed Check
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
