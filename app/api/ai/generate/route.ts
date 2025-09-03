import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getUserProfile, deductCredits } from '@/lib/supabaseServer'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured' 
      }, { status: 500 })
    }

    const response = NextResponse.next()
    const supabase = createServerSupabaseClient(request, response)

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, language = 'English' } = body

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Check user credits
    const profile = await getUserProfile(user.id)
    if (!profile || profile.credits < 1) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        credits: profile?.credits || 0
      }, { status: 402 })
    }

    // Generate AI response
    const systemPrompt = `You are a professional web developer. Generate a complete, modern, responsive website based on the user's request. The website should be built with HTML, CSS, and JavaScript. Include proper semantic HTML structure, modern CSS styling, and interactive JavaScript functionality where appropriate. Make it visually appealing and professional. Language preference: ${language}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })

    const generatedContent = completion.choices[0]?.message?.content

    if (!generatedContent) {
      return NextResponse.json({ 
        error: 'Failed to generate content' 
      }, { status: 500 })
    }

    // Deduct credits
    const deductResult = await deductCredits(user.id, 1, 'Website generation')

    if (!deductResult.success) {
      return NextResponse.json({ 
        error: 'Failed to deduct credits',
        details: deductResult.error
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      content: generatedContent,
      creditsRemaining: deductResult.newCredits,
      tokensUsed: completion.usage?.total_tokens || 0
    })

  } catch (error) {
    console.error('AI Generation API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'AI Generation endpoint is working',
    methods: ['POST']
  })
}