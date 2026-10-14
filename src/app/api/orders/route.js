import { NextResponse } from "next/server";
import { orderController } from "@/controllers";

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
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
