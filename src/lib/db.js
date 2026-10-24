import mysql from "mysql2/promise";

let pool;

export function getDbPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD ?? "",
      database: process.env.DB_NAME || "thoranam-db",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: "utf8mb4",
    });
  }
  return pool;
}

// Auto-initialize required tables corresponding to marked dashboard sections
export async function initDatabase() {
  const db = getDbPool();

  // 1. Categories Table (for Categories section)
  await db.query(`
    CREATE TABLE IF NOT EXISTS \`categories\` (
      \`id\` VARCHAR(100) PRIMARY KEY,
      \`label\` VARCHAR(255) NOT NULL,
      \`href\` VARCHAR(255) NOT NULL,
      \`featured\` BOOLEAN DEFAULT FALSE,
      \`subcategories\` JSON,
      \`showcase\` JSON,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 2. Products Table (for Products Catalog section)
  await db.query(`
    CREATE TABLE IF NOT EXISTS \`products\` (
      \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
      \`title\` VARCHAR(255) NOT NULL,
      \`category\` VARCHAR(150) NOT NULL,
      \`price\` VARCHAR(50) NOT NULL,
      \`stock\` INT DEFAULT 0,
      \`status\` ENUM('Published', 'Low Stock', 'Draft') DEFAULT 'Published',
      \`main_image\` VARCHAR(500),
      \`gallery_images\` JSON,
      \`description\` TEXT,
      \`highlights\` JSON,
      \`closing_description\` TEXT,
      \`material\` VARCHAR(255),
      \`size\` VARCHAR(150),
      \`wash_care\` TEXT,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 3. Orders Table (for Orders section)
  await db.query(`
    CREATE TABLE IF NOT EXISTS \`orders\` (
      \`id\` VARCHAR(50) PRIMARY KEY,
      \`customer_name\` VARCHAR(255) NOT NULL,
      \`customer_email\` VARCHAR(255),
      \`customer_phone\` VARCHAR(50),
      \`total_amount\` VARCHAR(50) NOT NULL,
      \`items_count\` INT DEFAULT 1,
      \`payment_status\` ENUM('Paid', 'Pending', 'Failed') DEFAULT 'Paid',
      \`order_status\` ENUM('New', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'New',
      \`shipping_address\` TEXT,
      \`items_details\` JSON,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 4. Customers Table (for Customers section)
  await db.query(`
    CREATE TABLE IF NOT EXISTS \`customers\` (
      \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
      \`name\` VARCHAR(255) NOT NULL,
      \`email\` VARCHAR(255) UNIQUE NOT NULL,
      \`phone\` VARCHAR(50),
      \`total_orders\` INT DEFAULT 0,
      \`total_spent\` VARCHAR(50) DEFAULT '₹ 0',
      \`last_order_date\` DATE,
      \`status\` ENUM('Active', 'Inactive', 'VIP') DEFAULT 'Active',
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 5. Discounts & Offers Table (for Promotions section)
  await db.query(`
    CREATE TABLE IF NOT EXISTS \`promotions\` (
      \`id\` VARCHAR(50) PRIMARY KEY,
      \`code\` VARCHAR(50) UNIQUE NOT NULL,
      \`discount_type\` ENUM('percentage', 'flat') DEFAULT 'percentage',
      \`discount_value\` DECIMAL(10,2) NOT NULL,
      \`min_order_value\` DECIMAL(10,2) DEFAULT 0,
      \`max_discount\` DECIMAL(10,2),
      \`expiry_date\` DATE,
      \`status\` ENUM('Active', 'Expired', 'Disabled') DEFAULT 'Active',
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 6. Store Settings Table (for Store Settings section)
  await db.query(`
    CREATE TABLE IF NOT EXISTS \`store_settings\` (
      \`setting_key\` VARCHAR(100) PRIMARY KEY,
      \`setting_value\` JSON,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Products start clean and populate from real boutique additions without fake seed products


  // Note: Orders and customers start empty and populate only when real orders/purchases are placed
  // Seed default sample discounts if empty

  // Seed default sample discounts if empty
  const [promoCount] = await db.query(`SELECT COUNT(*) as count FROM \`promotions\``);
  if (promoCount[0].count === 0) {
    await db.query(`
      INSERT INTO \`promotions\` (id, code, discount_type, discount_value, min_order_value, max_discount, expiry_date, status)
      VALUES 
        ('PROMO-1', 'DIWALI20', 'percentage', 20.00, 5000.00, 2000.00, '2026-11-30', 'Active'),
        ('PROMO-2', 'FIRST10', 'percentage', 10.00, 2000.00, 1000.00, '2026-12-31', 'Active'),
        ('PROMO-3', 'THORANAM500', 'flat', 500.00, 4000.00, 500.00, '2026-10-31', 'Active')
    `);
  }
}
