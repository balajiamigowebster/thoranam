import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { productController } from "@/controllers";

// GET /api/products
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const products = await productController.getAllProducts({ category, search });
    const hasProducts = Array.isArray(products) && products.length > 0;

    return NextResponse.json(
      { success: true, data: products },
      {
        headers: {
          "Cache-Control": hasProducts
            ? "public, s-maxage=60, stale-while-revalidate=300"
            : "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("API GET /api/products error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}

// POST /api/products
export async function POST(request) {
  try {
    const body = await request.json();
    const createdProduct = await productController.createProduct(body);

    try {
      revalidateTag("products");
      revalidatePath("/");
      revalidatePath("/products");
    } catch (e) {}

    return NextResponse.json({
      success: true,
      data: createdProduct,
      message: "Product created successfully with Sequelize ORM",
    });
  } catch (error) {
    console.error("API POST /api/products error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/products
export async function PUT(request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const updatedProduct = await productController.updateProduct(body.id, body);

    try {
      revalidateTag("products");
      revalidatePath("/");
      revalidatePath("/products");
    } catch (e) {}

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully with Sequelize ORM",
    });
  } catch (error) {
    console.error("API PUT /api/products error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/products?id=<id>
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const result = await productController.deleteProduct(id);

    try {
      revalidateTag("products");
      revalidatePath("/");
      revalidatePath("/products");
    } catch (e) {}

    return NextResponse.json(result);
  } catch (error) {
    console.error("API DELETE /api/products error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
