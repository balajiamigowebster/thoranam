import { NextResponse } from "next/server";
import { promotionController } from "@/controllers";

export async function GET() {
  try {
    const promotions = await promotionController.getAllPromotions();
    return NextResponse.json({ success: true, data: promotions });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
