import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const processedImages = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        continue;
      }

      // Generate unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = `img-${uniqueSuffix}.webp`;
      const filepath = path.join(uploadsDir, filename);

      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Optimize image with Sharp
      const optimizedBuffer = await sharp(buffer)
        .resize(1920, 1080, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();

      // Save optimized image
      await writeFile(filepath, optimizedBuffer);

      processedImages.push({
        url: `/uploads/${filename}`,
        filename: filename,
        originalName: file.name,
        size: optimizedBuffer.length,
        optimized: true,
      });
    }

    return NextResponse.json({
      success: true,
      images: processedImages,
      count: processedImages.length,
    });
  } catch (error: any) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to process images",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('images') as File[]

    // Mock image processing - in production, upload to storage
    const processedImages = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      url: `/api/images/placeholder/${Date.now()}-${index}`,
      size: file.size
    }))

    return NextResponse.json({
      success: true,
      images: processedImages
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to upload images' },
      { status: 500 }
    )
  }
}
