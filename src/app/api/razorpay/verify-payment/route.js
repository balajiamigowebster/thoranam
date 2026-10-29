import { NextResponse } from "next/server";
import crypto from "crypto";
import { orderController } from "@/controllers";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing Razorpay payment parameters" },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, message: "Server configuration missing Razorpay secret" },
        { status: 500 }
      );
    }

    // Official Razorpay HMAC-SHA256 signature verification
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.error("[Razorpay Verify] Invalid signature for payment:", razorpay_payment_id);
      return NextResponse.json(
        { success: false, message: "Payment verification failed: Invalid signature" },
        { status: 400 }
      );
    }

    // Signature verified! Save the completed order to MySQL database
    let savedOrder = null;
    if (orderData) {
      const orderPayload = {
        ...orderData,
        payment_status: "Paid",
        order_status: "New",
        notes: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        },
      };

      try {
        savedOrder = await orderController.createOrder(orderPayload);
      } catch (saveErr) {
        console.error("[Razorpay Verify] Failed to save order to DB:", saveErr);
        savedOrder = orderPayload;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
      order: savedOrder,
    });
  } catch (error) {
    console.error("[Razorpay verify-payment error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify Razorpay payment" },
      { status: 500 }
    );
  }
}

