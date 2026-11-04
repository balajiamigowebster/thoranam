import { NextResponse } from "next/server";
import { wishlistController } from "@/controllers";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Customer email is required" },
        { status: 400 }
      );
    }

    const items = await wishlistController.getWishlist(email);
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("[GET /api/wishlist error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, product, action, items } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Customer email is required" },
        { status: 400 }
      );
    }

    // Action: Batch sync upon login
    if (action === "sync" || Array.isArray(items)) {
      const syncResult = await wishlistController.syncBatch(email, items || []);
      return NextResponse.json({ success: true, ...syncResult });
    }

    // Action: Add single product
    if (!product || !product.id) {
      return NextResponse.json(
        { success: false, message: "Product is required" },
        { status: 400 }
      );
    }

    const result = await wishlistController.addToWishlist(email, product);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[POST /api/wishlist error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    let email = searchParams.get("email");
    let productId = searchParams.get("productId");

    if (!email || !productId) {
      try {
        const body = await request.json();
        email = email || body.email;
        productId = productId || body.productId;
      } catch (e) {}
    }

    if (!email || !productId) {
      return NextResponse.json(
        { success: false, message: "email and productId are required" },
        { status: 400 }
      );
    }

    const result = await wishlistController.removeFromWishlist(email, productId);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[DELETE /api/wishlist error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}

