import { Product } from "@/models";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    const { searchParams } = new URL(request.url);
    const galleryIdx = searchParams.get("gallery");

    if (!id) {
      return new Response("Product ID required", { status: 400 });
    }

    // Single product query selecting only image columns
    const product = await Product.findByPk(id, {
      attributes: galleryIdx !== null ? ["id", "main_image", "gallery_images"] : ["id", "main_image"],
    });

    if (!product) {
      return NextResponse.redirect(new URL("/images/product-1.jpg", request.url));
    }

    let targetImage = product.main_image;
    if (galleryIdx !== null) {
      try {
        const gallery = typeof product.gallery_images === "string"
          ? JSON.parse(product.gallery_images)
          : (product.gallery_images || []);
        const idx = parseInt(galleryIdx, 10);
        if (Array.isArray(gallery) && gallery[idx]) {
          targetImage = gallery[idx];
        }
      } catch (e) {
        // Fallback to main_image if parsing fails
      }
    }

    if (!targetImage || typeof targetImage !== "string" || targetImage.trim() === "") {
      return NextResponse.redirect(new URL("/images/product-1.jpg", request.url));
    }

    // If it's a data URL: parse buffer and stream binary image with permanent cache
    if (targetImage.startsWith("data:image/")) {
      const match = targetImage.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const buffer = Buffer.from(match[2], "base64");
        return new Response(buffer, {
          status: 200,
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }

    // If it's a relative path on public or uploads
    if (targetImage.startsWith("/")) {
      return NextResponse.redirect(new URL(targetImage, request.url));
    }

    // External URL
    if (targetImage.startsWith("http://") || targetImage.startsWith("https://")) {
      return NextResponse.redirect(targetImage);
    }

    return NextResponse.redirect(new URL("/images/product-1.jpg", request.url));
  } catch (err) {
    console.error("[Product Image API] error:", err.message);
    return NextResponse.redirect(new URL("/images/product-1.jpg", request.url));
  }
}

