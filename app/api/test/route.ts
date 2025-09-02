
import { NextRequest, NextResponse } from 'next/server'
import { testDatabaseConnection, getUserProfile, grantCredits, deductCredits, createUserProfile } from '@/lib/supabaseServer'
import OpenAI from 'openai'

export async function GET() {
  console.log('Starting comprehensive API tests...')
  console.log('🔍 Environment variables check:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.log('- OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY)
  
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [] as any[]
  }

  // Test 1: Environment Variables
  const envTest = {
    name: 'Environment Variables',
    status: 'pending' as 'pass' | 'fail' | 'pending',
    details: {} as any
  }

  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    ADMIN_EMAIL: !!process.env.ADMIN_EMAIL
  }

  const allEnvVarsSet = Object.values(envVars).every(Boolean)
  envTest.status = allEnvVarsSet ? 'pass' : 'fail'
  envTest.details = envVars
  testResults.tests.push(envTest)

  // Test 2: Database Connection
  const dbTest = {
    name: 'Database Connection',
    status: 'pending' as 'pass' | 'fail' | 'pending',
    details: {} as any
  }

  try {
    const isConnected = await testDatabaseConnection()
    dbTest.status = isConnected ? 'pass' : 'fail'
    dbTest.details = { connected: isConnected }
  } catch (error) {
    dbTest.status = 'fail'
    dbTest.details = { error: error instanceof Error ? error.message : 'Unknown error' }
  }
  testResults.tests.push(dbTest)

  // Test 3: OpenAI Connection
  const aiTest = {
    name: 'OpenAI API',
    status: 'pending' as 'pass' | 'fail' | 'pending',
    details: {} as any
  }

  console.log('🔍 Starting OpenAI API test...')
  console.log('Environment check - OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)
  
  try {
    console.log('Testing OpenAI API...')
    if (!process.env.OPENAI_API_KEY) {
      console.log('❌ OpenAI API Key not found')
      aiTest.status = 'fail'
      aiTest.details = { error: 'OPENAI_API_KEY environment variable not set' }
    } else {
      console.log('✅ OpenAI API Key found, creating client...')
      const openai = new OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY,
        timeout: 30000 // 30 second timeout
      })
      
      console.log('Sending request to OpenAI...')
      // Test with a simple completion
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Say "Hello World"' }],
        max_tokens: 10,
        temperature: 0
      })
      
      console.log('OpenAI response received:', completion)
      const response = completion.choices[0]?.message?.content
      if (response && response.trim().length > 0) {
        console.log('✅ OpenAI test passed')
        aiTest.status = 'pass'
        aiTest.details = { 
          response: response.trim(),
          model: completion.model,
          usage: completion.usage
        }
      } else {
        console.log('❌ OpenAI returned empty response')
        aiTest.status = 'fail'
        aiTest.details = { error: 'Empty response from OpenAI', completion }
      }
    }
  } catch (error) {
    console.log('❌ OpenAI test failed with error:', error)
    aiTest.status = 'fail'
    if (error instanceof Error) {
      aiTest.details = { 
        error: error.message,
        code: (error as any).code,
        type: (error as any).type,
        stack: error.stack
      }
    } else {
      aiTest.details = { error: 'Unknown error', details: String(error) }
    }
  }
  testResults.tests.push(aiTest)

  // Test 4: Credit System (using test user)
  const creditTest = {
    name: 'Credit System',
    status: 'pending' as 'pass' | 'fail' | 'pending',
    details: {} as any
  }

  console.log('🔍 Starting Credit System test...')
  console.log('Supabase admin client exists:', !!supabaseAdmin)
  
  try {
    console.log('Testing Credit System...')
    const testUserId = 'test-user-' + Date.now()
    const testEmail = `test-${Date.now()}@adorrable.dev`
    
    console.log('Creating test user profile:', { testUserId, testEmail })
    // First create a test user profile
    console.log('Calling createUserProfile function...')
    const profile = await createUserProfile(testUserId, testEmail, 'Test User')
    console.log('createUserProfile result:', profile)
    
    if (!profile) {
      console.log('❌ Failed to create test user profile')
      creditTest.status = 'fail'
      creditTest.details = { error: 'Failed to create test user profile' }
    } else {
      console.log('✅ Test user profile created:', profile)
      
      // Test granting credits
      console.log('Testing credit granting...')
      const grantResult = await grantCredits(testUserId, 5, 'Test credit grant')
      console.log('Grant result:', grantResult)
      
      if (grantResult.success) {
        console.log('✅ Credit granting successful')
        
        // Test deducting credits
        console.log('Testing credit deduction...')
        const deductResult = await deductCredits(testUserId, 2, 'Test credit deduction')
        console.log('Deduct result:', deductResult)
        
        if (deductResult.success) {
          console.log('✅ Credit system test passed')
          creditTest.status = 'pass'
          creditTest.details = {
            userId: testUserId,
            initialCredits: profile.credits,
            grantResult,
            deductResult,
            finalBalance: deductResult.newBalance
          }
        } else {
          console.log('❌ Credit deduction failed')
          creditTest.status = 'fail'
          creditTest.details = { 
            error: 'Credit deduction failed', 
            deductResult,
            userId: testUserId 
          }
        }
      } else {
        console.log('❌ Credit granting failed')
        creditTest.status = 'fail'
        creditTest.details = { 
          error: 'Credit granting failed', 
          grantResult,
          userId: testUserId 
        }
      }
    }
  } catch (error) {
    console.log('❌ Credit system test failed with error:', error)
    creditTest.status = 'fail'
    creditTest.details = { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }
  }
  testResults.tests.push(creditTest)

  console.log('Test results:', testResults)
  return NextResponse.json(testResults)
}
