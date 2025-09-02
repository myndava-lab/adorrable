
import { NextRequest, NextResponse } from 'next/server'
import { testDatabaseConnection, getUserProfile, grantCredits, deductCredits, createUserProfile } from '@/lib/supabaseServer'
import OpenAI from 'openai'

export async function GET() {
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

  try {
    if (!process.env.OPENAI_API_KEY) {
      aiTest.status = 'fail'
      aiTest.details = { error: 'OPENAI_API_KEY environment variable not set' }
    } else {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      
      // Test with a simple completion
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Say "Hello World"' }],
        max_tokens: 10,
        temperature: 0
      })
      
      const response = completion.choices[0]?.message?.content
      if (response && response.trim().length > 0) {
        aiTest.status = 'pass'
        aiTest.details = { 
          response: response.trim(),
          model: completion.model,
          usage: completion.usage
        }
      } else {
        aiTest.status = 'fail'
        aiTest.details = { error: 'Empty response from OpenAI', completion }
      }
    }
  } catch (error) {
    aiTest.status = 'fail'
    if (error instanceof Error) {
      aiTest.details = { 
        error: error.message,
        code: (error as any).code,
        type: (error as any).type
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

  try {
    const testUserId = 'test-user-' + Date.now()
    const testEmail = `test-${Date.now()}@adorrable.dev`
    
    // First create a test user profile
    const { createUserProfile } = await import('@/lib/supabaseServer')
    const profile = await createUserProfile(testUserId, testEmail, 'Test User')
    
    if (!profile) {
      creditTest.status = 'fail'
      creditTest.details = { error: 'Failed to create test user profile' }
    } else {
      // Test granting credits
      const grantResult = await grantCredits(testUserId, 5, 'Test credit grant')
      
      if (grantResult.success) {
        // Test deducting credits
        const deductResult = await deductCredits(testUserId, 2, 'Test credit deduction')
        
        if (deductResult.success) {
          creditTest.status = 'pass'
          creditTest.details = {
            userId: testUserId,
            initialCredits: profile.credits,
            grantResult,
            deductResult,
            finalBalance: deductResult.newBalance
          }
        } else {
          creditTest.status = 'fail'
          creditTest.details = { 
            error: 'Credit deduction failed', 
            deductResult,
            userId: testUserId 
          }
        }
      } else {
        creditTest.status = 'fail'
        creditTest.details = { 
          error: 'Credit granting failed', 
          grantResult,
          userId: testUserId 
        }
      }
    }
  } catch (error) {
    creditTest.status = 'fail'
    creditTest.details = { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }
  }
  testResults.tests.push(creditTest)

  return NextResponse.json(testResults)
}
