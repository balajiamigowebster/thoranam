import { NextResponse } from "next/server";
import { syncDatabase } from "@/models";
import { authController } from "@/controllers";

export async function GET() {
  try {
    // Force synchronize all 7 tables in MySQL
    const result = await syncDatabase({ alter: true });
    
    // Seed admin credentials from .env
    await authController.seedAdminUserIfNeeded();

    return NextResponse.json({
      success: true,
      message: "All database tables synchronized successfully!",
      tables: [
        "admin_users",
        "categories",
        "customers",
        "orders",
        "products",
        "promotions",
        "store_settings",
      ],
    });
  } catch (error) {
    console.error("Database sync error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
