import { NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay";

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, receipt, notes } = body;

    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid order amount" },
        { status: 400 }
      );
    }

    // Razorpay requires amount in subunits (paise for INR): ₹1 = 100 paise
    const amountInPaise = Math.round(numAmount * 100);

    const razorpay = getRazorpayClient();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      notes: notes || {},
    });

    return NextResponse.json({
      success: true,
      order: razorpayOrder,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("[Razorpay create-order error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.error?.description || error.message || "Failed to create Razorpay order",
      },
      { status: 500 }
    );
  }
}

