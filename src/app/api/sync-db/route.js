import { NextResponse } from "next/server";
import { syncDatabase } from "@/models";
import { authController } from "@/controllers";

export async function GET() {
  try {
    // Force synchronize all tables in MySQL
    const { sequelize } = await syncDatabase({ alter: true });

    // Explicitly add password_hash and auth_provider if missing in customers table
    try {
      await sequelize.query(
        "ALTER TABLE `customers` ADD COLUMN `password_hash` VARCHAR(255) NULL AFTER `phone`;"
      );
    } catch (e) {
      // Column may already exist
    }

    try {
      await sequelize.query(
        "ALTER TABLE `customers` ADD COLUMN `auth_provider` VARCHAR(50) DEFAULT 'email' AFTER `password_hash`;"
      );
    } catch (e) {
      // Column may already exist
    }

    try {
      await sequelize.query(
        "ALTER TABLE `categories` ADD COLUMN `image` VARCHAR(500) NULL AFTER `href`;"
      );
    } catch (e) {
      // Column may already exist
    }

    try {
      await sequelize.query(
        "ALTER TABLE `categories` ADD COLUMN `sort_order` INT DEFAULT 0 AFTER `image`;"
      );
    } catch (e) {
      // Column may already exist
    }
    
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
