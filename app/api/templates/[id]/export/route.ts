import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const templateId = params.id;
    const filepath = path.join(
      process.cwd(),
      "data",
      "templates",
      `${templateId}.json`,
    );

    if (!existsSync(filepath)) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    const templateData = await readFile(filepath, "utf8");
    const template = JSON.parse(templateData);

    // Return HTML file for download
    const filename = `${template.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.html`;

    return new NextResponse(template.code, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting template:", error);
    return NextResponse.json(
      {
        error: "Failed to export template",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Mock template retrieval - in production, fetch from database
    const mockHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Template</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Your Exported Template</h1>
        <p>Template ID: ${params.id}</p>
    </div>
</body>
</html>`

    return new NextResponse(mockHtmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="template-${params.id}.html"`
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to export template' },
      { status: 500 }
    )
  }
}
