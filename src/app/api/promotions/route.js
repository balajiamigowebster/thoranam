import { NextResponse } from "next/server";
import { promotionController } from "@/controllers";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const subtotal = searchParams.get("subtotal");

    // If query contains code, perform coupon validation
    if (code) {
      const result = await promotionController.validateCoupon(code, subtotal || 0);
      return NextResponse.json({ success: result.valid, ...result });
    }

    const promotions = await promotionController.getAllPromotions();
    return NextResponse.json({ success: true, data: promotions });
  } catch (error) {
    console.error("[GET /api/promotions] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch promotions" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Check if this is a validation request: { action: "validate", code, subtotal }
    if (body.action === "validate" || (body.code && body.subtotal !== undefined && !body.discount_value)) {
      const result = await promotionController.validateCoupon(body.code, body.subtotal);
      return NextResponse.json({ success: result.valid, ...result });
    }

    // Normal create promotion
    if (!body.code || !body.discount_value) {
      return NextResponse.json(
        { success: false, message: "Code and discount value are required" },
        { status: 400 }
      );
    }

    const created = await promotionController.createPromotion(body);
    return NextResponse.json({
      success: true,
      message: "Promotion created successfully",
      data: created,
    });
  } catch (error) {
    console.error("[POST /api/promotions] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create promotion" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const id = body.id || body.code;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Promotion ID is required for update" },
        { status: 400 }
      );
    }

    const updated = await promotionController.updatePromotion(id, body);
    return NextResponse.json({
      success: true,
      message: "Promotion updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("[PUT /api/promotions] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update promotion" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id || body?.code;
      } catch (e) {}
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Promotion ID or code is required" },
        { status: 400 }
      );
    }

    const result = await promotionController.deletePromotion(id);
    return NextResponse.json({
      success: true,
      message: "Promotion deleted successfully",
      ...result,
    });
  } catch (error) {
    console.error("[DELETE /api/promotions] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete promotion" },
      { status: 500 }
    );
  }
}
