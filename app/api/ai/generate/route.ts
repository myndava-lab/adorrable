import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Language-specific prompts
const languagePrompts = {
  English: {
    systemPrompt:
      "You are an expert web developer creating modern, responsive websites. Generate professional HTML/CSS/JS code based on the user's request.",
    contentStyle: "professional and engaging",
  },
  French: {
    systemPrompt:
      "Vous êtes un développeur web expert créant des sites web modernes et réactifs. Générez du code HTML/CSS/JS professionnel basé sur la demande de l'utilisateur.",
    contentStyle: "professionnel et engageant",
  },
  Swahili: {
    systemPrompt:
      "Wewe ni mtaalamu wa ukuzaji wa wavuti unayeunda tovuti za kisasa na zinazoweza kubadilika. Tengeneza msimbo wa HTML/CSS/JS wa kitaalamu kulingana na ombi la mtumiaji.",
    contentStyle: "wa kitaaluma na wa kuvutia",
  },
  Pidgin: {
    systemPrompt:
      "You be expert web developer wey dey create modern, responsive websites. Generate professional HTML/CSS/JS code based on wetin user want.",
    contentStyle: "professional and engaging",
  },
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

    const langConfig = languagePrompts[language] || languagePrompts.English;

    // Construct the full prompt
    const fullPrompt = `
${langConfig.systemPrompt}

User Request: ${prompt}
Language: ${language}
Attached Images: ${images.length > 0 ? `${images.length} images provided` : "No images"}

Requirements:
1. Create a complete, modern website template
2. Include HTML structure, CSS styling, and basic JavaScript
3. Make it responsive and mobile-friendly
4. Use ${langConfig.contentStyle} content in ${language}
5. Include appropriate meta tags and SEO optimization
6. Add modern design elements with gradients and animations
7. Make it culturally relevant for African markets when appropriate
8. Use vibrant colors and modern UI principles
9. Include proper typography and spacing

Generate a complete HTML file with embedded CSS and JavaScript that creates a beautiful, functional website.
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
