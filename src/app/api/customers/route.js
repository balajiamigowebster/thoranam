import { NextResponse } from "next/server";
import { customerController } from "@/controllers";

export async function GET() {
  try {
    const customers = await customerController.getAllCustomers();
    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
