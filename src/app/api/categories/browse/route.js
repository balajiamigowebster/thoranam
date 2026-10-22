import { NextResponse } from "next/server";
import { categoryController } from "@/controllers";

export async function GET() {
  try {
    const categories = await categoryController.getBrowseCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("API GET /api/categories/browse error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Expected array of browse categories" },
        { status: 400 }
      );
    }
    await categoryController.syncBrowseCategories(body);
    return NextResponse.json({ success: true, message: "Homepage browse categories synced successfully" });
  } catch (error) {
    console.error("API POST /api/categories/browse error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
