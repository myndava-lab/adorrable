
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseServer'
import { getUserProfile, deductCredits } from '@/lib/supabaseServer'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.next()
    const supabase = createServerSupabaseClient(request, response)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await getUserProfile(user.id)
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.credits < 1) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 })
    }

    const body = await request.json()
    const { prompt, language = 'English' } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Generate website with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional web developer. Create a complete, modern, responsive HTML website based on the user's prompt. Include inline CSS and JavaScript. Make it visually appealing with modern design principles. Language: ${language}`
        },
        {
          role: "user",
          content: `Create a website for: ${prompt}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const generatedHTML = completion.choices[0]?.message?.content || '<html><body><h1>Generation failed</h1></body></html>'

    // Deduct credits
    const creditResult = await deductCredits(user.id, 1, 'AI website generation', {
      prompt,
      language,
      model: 'gpt-3.5-turbo'
    })

    if (!creditResult.success) {
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      html: generatedHTML,
      creditsUsed: 1,
      creditsRemaining: creditResult.newBalance || 0
    })

  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'AI generation failed' 
    }, { status: 500 })
  }
}
