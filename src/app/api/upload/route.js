import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
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
      const buffer = Buffer.from(bytes);
      const mime = file.type || "image/jpeg";

      try {
        await mkdir(uploadDir, { recursive: true });
        const rawName = file.name || "saree-image.jpg";
        const sanitizedName = rawName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const filename = `${Date.now()}-${sanitizedName}`;
        const filePath = path.join(uploadDir, filename);

        await writeFile(filePath, buffer);
        uploadedUrls.push(`/uploads/${filename}`);
      } catch (fsErr) {
        // If running in a read-only serverless environment (e.g. Vercel), fallback to optimized data URL
        console.warn("[Upload API] Read-only filesystem detected, converting file to base64 data URL:", fsErr.message);
        const base64 = buffer.toString("base64");
        uploadedUrls.push(`data:${mime};base64,${base64}`);
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
