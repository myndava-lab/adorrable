import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getUserProfile, deductCredits } from '@/lib/supabaseServer'
import OpenAI from 'openai'

// Helper functions for prompt analysis
function extractRegion(prompt: string): string | null {
  const regionKeywords = {
    'ng': ['nigeria', 'nigerian', 'lagos', 'abuja', 'naira', 'paystack'],
    'ke': ['kenya', 'kenyan', 'nairobi', 'mombasa', 'shilling', 'mpesa'],
    'in': ['india', 'indian', 'mumbai', 'delhi', 'rupee', 'razorpay'],
    'us': ['usa', 'america', 'american', 'dollar', 'stripe'],
    'eu': ['europe', 'european', 'euro', 'gdpr'],
    'as': ['asia', 'asian', 'singapore', 'malaysia', 'alipay']
  }
  
  const lowerPrompt = prompt.toLowerCase()
  for (const [region, keywords] of Object.entries(regionKeywords)) {
    if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
      return region
    }
  }
  return null
}

function extractIndustry(prompt: string): string | null {
  const industryKeywords = {
    'restaurant': ['restaurant', 'food', 'dining', 'cafe', 'kitchen', 'menu'],
    'fashion': ['fashion', 'clothing', 'boutique', 'style', 'apparel'],
    'realestate': ['property', 'real estate', 'homes', 'apartments', 'housing'],
    'ecommerce': ['shop', 'store', 'ecommerce', 'retail', 'products'],
    'portfolio': ['portfolio', 'creative', 'designer', 'artist'],
    'agency': ['agency', 'marketing', 'advertising', 'consulting'],
    'clinic': ['clinic', 'hospital', 'medical', 'health', 'doctor'],
    'education': ['school', 'education', 'academy', 'learning'],
    'consultancy': ['consulting', 'consultancy', 'advisory', 'strategy'],
    'saas': ['saas', 'software', 'platform', 'app'],
    'freelancer': ['freelance', 'freelancer', 'consultant'],
    'hospitality': ['hotel', 'resort', 'hospitality', 'spa']
  }
  
  const lowerPrompt = prompt.toLowerCase()
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
      return industry
    }
  }
  return null
}

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

    // Try to find matching template first
    const { findTemplate, getCulturalPaymentMethod, templateCatalog } = await import('@/lib/templates')
    
    // Extract region and industry from prompt (simple keyword matching)
    const region = extractRegion(prompt) || 'global'
    const industry = extractIndustry(prompt) || 'general'
    
    // Find best matching template
    const matchedTemplate = findTemplate(region, industry, profile.subscription_tier)
    
    let generatedContent: string;
    
    if (matchedTemplate && matchedTemplate.id !== 'general_free') {
      // Use template-based generation
      const paymentMethod = getCulturalPaymentMethod(region)
      
      const templatePrompt = `You are an expert conversion copywriter & front-end developer.
Goal: Create a culturally-aware website using the provided template structure.
Requirements:
- Respect region: ${region} (design, tone, cultural nuances)
- Language: ${language}. If ${language} is pidgin or swahili, keep copy authentic but professional
- Payments must reflect region: ${paymentMethod}
- Keep copy concise, CTA-forward, no lorem ipsum
- User request: "${prompt}"
- Template structure: ${JSON.stringify(matchedTemplate.data, null, 2)}

Customize the template content to match the user's specific request while maintaining the cultural context and structure. Return complete HTML with embedded CSS using the template's color scheme and fonts.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: templatePrompt }
        ],
        max_tokens: 3000,
        temperature: 0.6
      })
      
      generatedContent = completion.choices[0]?.message?.content || ''
    } else {
      // Fallback to general AI generation
      const systemPrompt = `You are an expert conversion copywriter & front-end developer.
Goal: Create a professional, culturally-aware website.
Requirements:
- Respect cultural context and regional preferences
- Language: ${language}
- Create modern, responsive HTML with embedded CSS
- Include proper semantic structure
- Make it visually appealing and conversion-focused
- No lorem ipsum - use realistic, relevant content
- User request: "${prompt}"

Generate complete HTML with embedded CSS and minimal JavaScript if needed.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2500,
        temperature: 0.7
      })
      
      generatedContent = completion.choices[0]?.message?.content || ''
    }

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
      tokensUsed: completion?.usage?.total_tokens || 0,
      templateUsed: matchedTemplate?.id || 'ai_generated',
      region: region,
      industry: industry
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