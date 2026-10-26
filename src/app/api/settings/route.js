import { NextResponse } from "next/server";
import { settingsController } from "@/controllers";

export async function GET() {
  try {
    const settings = await settingsController.getSettings();
    return NextResponse.json(
      { success: true, data: settings },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await settingsController.updateSettings(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
