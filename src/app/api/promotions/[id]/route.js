import { NextResponse } from "next/server";
import { promotionController } from "@/controllers";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const promo = await promotionController.getPromotionById(id) || await promotionController.getPromotionByCode(id);
    if (!promo) {
      return NextResponse.json({ success: false, message: "Promotion not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: promo });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await promotionController.updatePromotion(id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await promotionController.deletePromotion(id);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

