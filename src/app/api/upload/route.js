import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { uploadMiddleware } from "@/middleware/uploadMiddleware";

export async function POST(request) {
  try {
    // 1. Validate images through uploadMiddleware
    const validation = await uploadMiddleware(request);
    if (!validation.isValid) {
      return validation.response;
    }

    const data = await request.formData();
    const files = data.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No files received" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");

    const uploadedUrls = [];

    for (const file of files) {
      if (typeof file === "string") continue;
      const bytes = await file.arrayBuffer();
      const inputBuffer = Buffer.from(bytes);

      // Automatically optimize & convert to high-resolution lightweight WebP (<90 KB)
      let optimizedBuffer = inputBuffer;
      let ext = "webp";
      try {
        optimizedBuffer = await sharp(inputBuffer)
          .resize(1200, 1500, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();
      } catch (sharpErr) {
        console.warn("[Upload API] Sharp compression notice:", sharpErr.message);
        optimizedBuffer = inputBuffer;
        ext = file.name?.split(".").pop() || "jpg";
      }

      try {
        await mkdir(uploadDir, { recursive: true });
        const rawBase = (file.name || "saree")
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9_-]/g, "_");
        const filename = `${Date.now()}-${rawBase}.${ext}`;
        const filePath = path.join(uploadDir, filename);

        await writeFile(filePath, optimizedBuffer);
        uploadedUrls.push(`/uploads/${filename}`);
      } catch (fsErr) {
        // If running in a read-only serverless environment (e.g. Vercel), fallback to optimized data URL
        console.warn("[Upload API] Read-only filesystem detected, fallback to compressed WebP data URL:", fsErr.message);
        const base64 = optimizedBuffer.toString("base64");
        uploadedUrls.push(`data:image/webp;base64,${base64}`);
      }
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      url: uploadedUrls[0] || null,
      message: `${uploadedUrls.length} image(s) processed successfully`,
    });
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
