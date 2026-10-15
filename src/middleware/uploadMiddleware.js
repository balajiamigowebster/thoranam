import { NextResponse } from "next/server";

const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

/**
 * Image Upload Validation Middleware
 * Validates file presence, extensions, MIME types, and file size limits
 */
export async function uploadMiddleware(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return {
        isValid: false,
        response: NextResponse.json(
          { success: false, message: "Invalid Content-Type. Multipart form-data expected." },
          { status: 400 }
        ),
      };
    }

    const formData = await request.clone().formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return {
        isValid: false,
        response: NextResponse.json(
          { success: false, message: "No image files provided." },
          { status: 400 }
        ),
      };
    }

    for (const file of files) {
      if (typeof file === "string") continue;

      // Validate file size
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        return {
          isValid: false,
          response: NextResponse.json(
            {
              success: false,
              message: `File "${file.name}" exceeds maximum allowed upload size of 10MB.`,
            },
            { status: 413 }
          ),
        };
      }

      // Validate file type
      const mime = file.type?.toLowerCase();
      const extMatch = file.name?.match(/\.([a-zA-Z0-9]+)$/);
      const ext = extMatch ? extMatch[1].toLowerCase() : "";
      const validExtensions = ["jpg", "jpeg", "png", "webp", "avif", "gif"];

      if (!validExtensions.includes(ext) && !ALLOWED_IMAGE_MIME_TYPES.includes(mime)) {
        return {
          isValid: false,
          response: NextResponse.json(
            {
              success: false,
              message: `Unsupported file format for "${file.name}". Only JPG, PNG, WEBP, AVIF, and GIF images are allowed into uploads.`,
            },
            { status: 415 }
          ),
        };
      }
    }

    return { isValid: true };
  } catch (err) {
    console.error("Upload middleware error:", err);
    return {
      isValid: false,
      response: NextResponse.json(
        { success: false, message: "Error validating uploaded file." },
        { status: 500 }
      ),
    };
  }
}

export default uploadMiddleware;
