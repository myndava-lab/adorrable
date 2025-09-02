import { NextRequest, NextResponse } from 'next/server'
import { testDatabaseConnection, getUserProfile, grantCredits, deductCredits, createUserProfile, supabaseAdmin } from '@/lib/supabaseServer'
import OpenAI from 'openai'

export async function GET() {
  console.log('🔍 Starting comprehensive API tests...')
  console.log('🔍 Environment variables check:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.log('- OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY)

  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [] as any[]
  }

  try {
    // Test 1: Environment Variables
    const envTest = {
      name: 'Environment Variables',
      status: 'pending' as 'pass' | 'fail' | 'pending',
      details: {} as any
    }

    const requiredEnvs = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL
    }

    console.log('📋 Environment Variables Check:', {
      NEXT_PUBLIC_SUPABASE_URL: !!requiredEnvs.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!requiredEnvs.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!requiredEnvs.SUPABASE_SERVICE_ROLE_KEY,
      OPENAI_API_KEY: !!requiredEnvs.OPENAI_API_KEY,
      NEXTAUTH_SECRET: !!requiredEnvs.NEXTAUTH_SECRET,
      ADMIN_EMAIL: !!requiredEnvs.ADMIN_EMAIL
    })

    const missingEnvs = Object.entries(requiredEnvs).filter(([key, value]) => !value)
    envTest.status = missingEnvs.length === 0 ? 'pass' : 'fail'
    envTest.details = { missingEnvs: missingEnvs.map(([key]) => key) }
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
      console.error('❌ Database connection test failed:', error)
      dbTest.status = 'fail'
      dbTest.details = { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined }
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
        throw new Error('OPENAI_API_KEY not found in environment variables')
      }

      console.log('🤖 Testing OpenAI API connection...')
      console.log('OpenAI API Key present:', !!process.env.OPENAI_API_KEY)

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })

      console.log('📡 Making OpenAI API request...')
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Say 'Test successful'" }],
        max_tokens: 50
      })

      console.log('✅ OpenAI API test successful:', response)
      aiTest.status = 'pass'
      aiTest.details = {
        response: response.choices[0]?.message?.content,
        usage: response.usage
      }
    } catch (error) {
      console.error('❌ OpenAI API test failed:', error)
      aiTest.status = 'fail'
      aiTest.details = {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }
    testResults.tests.push(aiTest)

    // Test 4: Credit System
    const creditTest = {
      name: 'Credit System',
      status: 'pending' as 'pass' | 'fail' | 'pending',
      details: {} as any
    }

    try {
      console.log('💰 Testing Credit System...')

      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
      }

      // Create a test user profile
      const testUserId = 'test-user-' + Date.now()
      const testEmail = 'test@example.com'

      console.log('👤 Creating test user profile...')
      console.log('Test user ID:', testUserId)
      console.log('Test email:', testEmail)

      const profileResult = await createUserProfile(testUserId, testEmail)
      console.log('Profile creation result:', profileResult)

      if (profileResult.success) {
        console.log('💳 Testing credit operations...')

        // Test granting credits
        console.log('Granting 100 credits...')
        const grantResult = await grantCredits(testUserId, 100)
        console.log('Grant credits result:', grantResult)

        if (grantResult.success) {
          // Test deducting credits
          console.log('Deducting 10 credits...')
          const deductResult = await deductCredits(testUserId, 10)
          console.log('Deduct credits result:', deductResult)

          if (deductResult.success) {
            creditTest.status = 'pass'
            creditTest.details = {
              profile: profileResult.profile,
              grantedCredits: grantResult.newBalance,
              deductedCredits: deductResult.newBalance
            }
            console.log('✅ Credit system test passed!')
          } else {
            creditTest.status = 'fail'
            creditTest.details = { error: 'Failed to deduct credits', deductResult }
          }
        } else {
          creditTest.status = 'fail'
          creditTest.details = { error: 'Failed to grant credits', grantResult }
        }
      } else {
        creditTest.status = 'fail'
        creditTest.details = { error: 'Failed to create user profile', profileResult }
      }
    } catch (error) {
      console.error('❌ Credit System test failed:', error)
      creditTest.status = 'fail'
      creditTest.details = {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }
    testResults.tests.push(creditTest)

    console.log('🎯 Test Results Summary:', testResults)

    return NextResponse.json(testResults)

  } catch (error) {
    console.error('❌ Fatal error in test suite:', error)
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: 'Test suite failed to execute',
      details: error instanceof Error ? error.message : 'Unknown error',
      tests: []
    }, { status: 500 })
  }
}