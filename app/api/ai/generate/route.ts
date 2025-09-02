import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getUserProfile, deductCredits } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured')
      return NextResponse.json({ 
        error: 'OpenAI API key not configured',
        details: 'Missing OPENAI_API_KEY environment variable'
      }, { status: 500 })
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const body = await request.json()
    const { prompt, userId } = body

    if (!prompt || !userId) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'Both prompt and userId are required'
      }, { status: 400 })
    }

    // Check user credits
    const profile = await getUserProfile(userId)
    if (!profile) {
      return NextResponse.json({ 
        error: 'User profile not found',
        details: `No profile found for userId: ${userId}`
      }, { status: 404 })
    }

    if (profile.credits < 1) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        details: `Current balance: ${profile.credits} credits`
      }, { status: 402 })
    }

    // Generate content with OpenAI
    console.log('Generating content with OpenAI for user:', userId)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful website generator assistant. Create detailed, professional website content based on the user\'s request.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })

    const generatedContent = completion.choices[0]?.message?.content

    if (!generatedContent) {
      return NextResponse.json({ 
        error: 'Failed to generate content',
        details: 'OpenAI returned empty response'
      }, { status: 500 })
    }

    // Deduct credits
    console.log('Deducting 1 credit from user:', userId)
    const creditResult = await deductCredits(userId, 1, 'AI generation', { prompt: prompt.substring(0, 100) })

    if (!creditResult.success) {
      console.error('Credit deduction failed:', creditResult.error)
      return NextResponse.json({ 
        error: 'Failed to deduct credits',
        details: creditResult.error
      }, { status: 500 })
    }

    console.log('AI generation successful for user:', userId, 'New balance:', creditResult.newBalance)

    return NextResponse.json({
      content: generatedContent,
      creditsRemaining: creditResult.newBalance,
      success: true
    })

  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}