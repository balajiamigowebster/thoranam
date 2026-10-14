import { NextResponse } from "next/server";
import { productController } from "@/controllers";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const product = await productController.getProductById(id);

    if (!product) {
      // Check if maybe searching by slug
      const all = await productController.getAllProducts();
      const matched = all.find(
        (p) =>
          String(p.id) === String(id) ||
          p.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") === String(id).toLowerCase()
      );
      if (matched) {
        return NextResponse.json({ success: true, data: matched });
      }

      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("API GET /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
