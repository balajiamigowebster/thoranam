import { NextResponse } from "next/server";
import { categoryController } from "@/controllers";

export async function GET() {
  try {
    const categories = await categoryController.getAllCategories();
    return NextResponse.json(
      { success: true, data: categories },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("API GET /api/categories error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (Array.isArray(body)) {
      await categoryController.syncAllCategories(body);
      return NextResponse.json({ success: true, message: "Categories synced with Sequelize" });
    } else {
      const created = await categoryController.createCategory(body);
      return NextResponse.json({ success: true, data: created });
    }
  } catch (error) {
    console.error("API POST /api/categories error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
