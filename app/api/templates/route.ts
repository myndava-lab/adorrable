import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, readdir, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const templatesDir = path.join(process.cwd(), "data", "templates");

// Ensure templates directory exists
async function ensureTemplatesDir() {
  if (!existsSync(templatesDir)) {
    await mkdir(templatesDir, { recursive: true });
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureTemplatesDir();

    const { searchParams } = new URL(req.url);
    const language = searchParams.get("language");
    const limit = parseInt(searchParams.get("limit") || "50");

    const files = await readdir(templatesDir);
    let templates = [];

    for (const filename of files) {
      if (filename.endsWith(".json")) {
        try {
          const filepath = path.join(templatesDir, filename);
          const data = await readFile(filepath, "utf8");
          templates.push(JSON.parse(data));
        } catch (error) {
          console.error(`Error reading template ${filename}:`, error);
        }
      }
    }

    // Filter by language if specified
    if (language) {
      templates = templates.filter((t) => t.language === language);
    }

    // Sort by creation date (newest first)
    templates.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Limit results
    templates = templates.slice(0, limit);

    return NextResponse.json({
      success: true,
      templates: templates,
      count: templates.length,
    });
  } catch (error: any) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch templates",
        message: error.message,
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTemplatesDir();

    const template = await req.json();

    // Validate required fields
    if (!template.title || !template.code || !template.language) {
      return NextResponse.json(
        {
          error: "Missing required fields: title, code, language",
        },
        { status: 400 },
      );
    }

    // Generate ID if not provided
    if (!template.id) {
      template.id = Date.now();
    }

    // Add metadata
    template.createdAt = new Date().toISOString();
    template.updatedAt = new Date().toISOString();

    // Save to file
    const filepath = path.join(templatesDir, `${template.id}.json`);
    await writeFile(filepath, JSON.stringify(template, null, 2));

    return NextResponse.json({
      success: true,
      template: template,
      message: "Template saved successfully",
    });
  } catch (error: any) {
    console.error("Error saving template:", error);
    return NextResponse.json(
      {
        error: "Failed to save template",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
