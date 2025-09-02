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