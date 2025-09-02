import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cultural intelligence configurations
const getCulturalConfig = (language: string, region?: string) => {
  // Auto-detect region from language if not provided
  const detectRegion = (lang: string) => {
    if (lang === "French") return "EU";
    if (lang === "Swahili" || lang === "Pidgin") return "Africa";
    return "Global";
  };

  const currentRegion = region || detectRegion(language);

  const configs = {
    English: {
      contentStyle: "professional and modern",
      culturalNotes: "Include African cultural elements and vibrant colors",
      region: "Africa"
    },
    French: {
      contentStyle: "élégant et sophistiqué",
      culturalNotes: "Incorporate Francophone African aesthetics and cultural references",
      region: "Africa"
    },
    Swahili: {
      contentStyle: "jamii na utamaduni",
      culturalNotes: "Include East African cultural elements and community-focused design",
      region: "Africa"
    },
    Pidgin: {
      contentStyle: "friendly and relatable",
      culturalNotes: "Use Nigerian cultural references and vibrant West African aesthetics",
      region: "Africa"
    },
  };

  // Regional overrides for cultural intelligence
  const regionalConfig = {
    Africa: {
      paymentMethods: "WhatsApp CTA, Paystack, NDPR compliance",
      designElements: "Vibrant colors, cultural patterns, community-focused",
      businessStyle: "Relationship-driven, storytelling approach"
    },
    EU: {
      paymentMethods: "GDPR badges, cookie banner, SEPA payments",
      designElements: "Clean minimalism, accessibility focus, privacy-first",
      businessStyle: "Compliance-focused, trust indicators, data protection"
    },
    US: {
      paymentMethods: "ROI proof, Apple/Google Pay, conversion optimization",
      designElements: "Bold CTAs, social proof, performance metrics",
      businessStyle: "Results-driven, testimonials, growth-focused"
    },
    Asia: {
      paymentMethods: "QR codes, Alipay/WeChat integration, mobile-first",
      designElements: "Mobile optimization, social commerce, chat features",
      businessStyle: "Social integration, mobile experience, community features"
    }
  };

  const baseConfig = configs[language] || configs.English;
  const regional = regionalConfig[currentRegion] || regionalConfig.Africa;

  return {
    ...baseConfig,
    ...regional,
    detectedRegion: currentRegion
  };
};

export async function POST(req: NextRequest) {
  try {
    const { prompt, language = "English", images = [] } = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    // Enhanced cultural intelligence
    const culturalConfig = getCulturalConfig(language,
      prompt.toLowerCase().includes('europe') || prompt.toLowerCase().includes('eu') ? 'EU' :
      prompt.toLowerCase().includes('america') || prompt.toLowerCase().includes('usa') || prompt.toLowerCase().includes('us ') ? 'US' :
      prompt.toLowerCase().includes('asia') || prompt.toLowerCase().includes('china') || prompt.toLowerCase().includes('japan') || prompt.toLowerCase().includes('korea') ? 'Asia' :
      undefined
    );

    const fullPrompt = `Create a beautiful, modern website template with cultural intelligence for the ${culturalConfig.detectedRegion} market:

${prompt}

User Request: ${prompt}
Language: ${language}
Target Region: ${culturalConfig.detectedRegion}
Attached Images: ${images.length > 0 ? `${images.length} images provided` : "No images"}

Requirements:
1. Create a complete, modern website template
2. Include HTML structure, CSS styling, and basic JavaScript
3. Make it responsive and mobile-friendly
4. Use ${culturalConfig.contentStyle} content in ${language}
5. Include appropriate meta tags and SEO optimization
6. Add modern design elements with gradients and animations
7. Apply regional cultural intelligence:
   - Payment Methods: ${culturalConfig.paymentMethods}
   - Design Elements: ${culturalConfig.designElements}
   - Business Style: ${culturalConfig.businessStyle}
8. Cultural Notes: ${culturalConfig.culturalNotes}
9. Include proper typography and spacing
10. Ensure accessibility and modern web standards

Regional Specific Features:
${culturalConfig.detectedRegion === 'EU' ? '- GDPR compliance indicators\n- Cookie consent banner\n- Privacy policy links\n- Accessibility features' : ''}
${culturalConfig.detectedRegion === 'US' ? '- ROI/conversion focus\n- Social proof sections\n- Performance metrics\n- Bold call-to-actions' : ''}
${culturalConfig.detectedRegion === 'Asia' ? '- QR code integration\n- Mobile-first design\n- Social commerce features\n- Chat/messaging UI elements' : ''}
${culturalConfig.detectedRegion === 'Africa' ? '- WhatsApp integration\n- Vibrant color schemes\n- Community-focused design\n- Local payment options' : ''}

Generate a complete HTML file with embedded CSS and JavaScript that creates a beautiful, culturally-intelligent website.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert web developer specializing in creating beautiful, modern websites with cultural sensitivity for African markets. Always generate complete, working HTML files.",
        },
        {
          role: "user",
          content: fullPrompt,
        },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    const generatedCode = completion.choices[0].message.content;

    // Parse and structure the response
    const template = {
      id: Date.now(),
      title: prompt,
      language: language,
      code: generatedCode,
      images: images,
      createdAt: new Date().toISOString(),
      metadata: {
        model: "gpt-4",
        tokens: completion.usage?.total_tokens || 0,
        culturallyAdapted: language !== "English",
      },
    };

    return NextResponse.json({
      success: true,
      template: template,
      message: `Template generated successfully in ${language}`,
    });
  } catch (error: any) {
    console.error("AI Generation Error:", error);

    if (error.code === "insufficient_quota") {
      return NextResponse.json(
        {
          error: "AI service quota exceeded",
          message: "Please try again later or upgrade your plan",
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to generate template",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { prompt, language, images, culturalConfig } = await req.json()

    // Mock response for now - replace with actual AI integration
    const mockTemplate = {
      id: Date.now().toString(),
      title: `${language} Website Template`,
      language: language,
      code: `<!DOCTYPE html>
<html lang="${language.toLowerCase()}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Template</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 40px; text-align: center; }
        .content { padding: 40px; }
        .footer { background: #1f2937; color: white; padding: 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to Your ${language} Website</h1>
        <p>Generated based on: ${prompt}</p>
    </div>
    <div class="content">
        <h2>Your Content Here</h2>
        <p>This template was generated with cultural adaptation for ${culturalConfig?.detectedRegion || 'Global'} market.</p>
    </div>
    <div class="footer">
        <p>Powered by Adorrable.dev</p>
    </div>
</body>
</html>`
    }

    return NextResponse.json({
      success: true,
      template: mockTemplate,
      usage: { total_tokens: 1000 }
    })

  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to generate template' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserProfile, deductCredits } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt, language } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Check user credits
    const profile = await getUserProfile(user.id)
    if (!profile || profile.credits < 1) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 })
    }

    // Deduct credits
    const creditResult = await deductCredits(
      user.id, 
      1, 
      'AI website generation',
      { prompt, language }
    )

    if (!creditResult.success) {
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 400 })
    }

    // Simulate AI generation (replace with actual AI integration later)
    const generatedWebsite = {
      id: `site_${Date.now()}`,
      title: `Generated Website`,
      description: prompt,
      language: language,
      html: `
        <!DOCTYPE html>
        <html lang="${language === 'English' ? 'en' : 'fr'}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Generated Website</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .container { max-width: 1200px; margin: 0 auto; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Your Generated Website</h1>
            <p>Based on your prompt: "${prompt}"</p>
            <p>Language: ${language}</p>
            <p>Generated at: ${new Date().toISOString()}</p>
          </div>
        </body>
        </html>
      `,
      createdAt: new Date().toISOString(),
      creditsUsed: 1
    }

    return NextResponse.json({ 
      success: true, 
      website: generatedWebsite,
      creditsRemaining: creditResult.newBalance
    })

  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
