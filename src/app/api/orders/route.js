import { NextResponse } from "next/server";
import { orderController } from "@/controllers";
import { sendOrderNotificationEmail } from "@/lib/email";

export async function GET() {
  try {
    const orders = await orderController.getAllOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const order = await orderController.createOrder(body);

    // Send email notification for direct/COD orders in background
    try {
      sendOrderNotificationEmail(order, {
        paymentId: body.payment_id || "COD (Cash on Delivery)",
      }).catch((emailErr) => {
        console.error("[Orders API] Background email error:", emailErr);
      });
    } catch (e) {
      console.warn("[Orders API] Email trigger warning:", e);
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
