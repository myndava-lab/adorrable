
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
