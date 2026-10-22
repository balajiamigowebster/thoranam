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

  // Seed default products if empty
  const [productCount] = await db.query(`SELECT COUNT(*) as count FROM \`products\``);
  if (productCount[0].count === 0) {
    const seedProducts = [
      [
        "Semi Mangalagiri Saree",
        "Semi Silk Sarees",
        "₹ 4,899",
        14,
        "Published",
        "/images/product-1.jpg",
        JSON.stringify(["/images/product-2.jpg", "/images/product-3.jpg"]),
        "A stunning handcrafted Semi Mangalagiri saree woven with precision and heritage techniques. Designed to drape effortlessly, offering timeless sophistication and supreme comfort throughout the day.",
        JSON.stringify([
          "Authentic artisanal zari woven border",
          "Breathable and feather-light drape",
          "Contrasting rich pallu with subtle tasselled finishing",
          "Comes with an unstitched coordinated blouse piece"
        ]),
        "Crafted for the modern woman rooted in tradition. This masterpiece embodies boutique heritage craftsmanship, perfect for festivals, auspicious ceremonies, and celebration banquets.",
        "Pure Mangalagiri Cotton with Silk Blend & Tested Zari",
        "6.3 Meters (includes 0.8m running blouse piece)",
        "Dry clean recommended for initial wash. Gentle hand wash in cold water with mild detergent thereafter."
      ],
      [
        "Kanchipuram Silk Saree",
        "Silk Sarees",
        "₹ 14,250",
        18,
        "Published",
        "/images/product-2.jpg",
        JSON.stringify(["/images/product-1.jpg", "/images/product-4.jpg"]),
        "Woven in the temple town of Kanchipuram, this pure silk saree displays opulent floral and peacock motifs rendered in shimmering zari threads with grand contrast borders.",
        JSON.stringify([
          "Pure Mulberry Silk certified quality",
          "Heavy gold zari brocade pallu",
          "Traditional korvai weaving technique",
          "Ideal bridal and grand occasion heirloom piece"
        ]),
        "An enduring symbol of Indian royal grace. Its heirloom texture and rich luster bring breathtaking presence to weddings and milestone celebrations.",
        "100% Pure Kanchipuram Silk & Metallic Zari",
        "6.2 Meters with 80cm matching blouse",
        "Strictly Dry Clean Only. Store wrapped in pure muslin cloth."
      ],
      [
        "Exotic Chanderi Saree",
        "Exotic Cotton Sarees",
        "₹ 3,499",
        2,
        "Low Stock",
        "/images/product-3.jpg",
        JSON.stringify(["/images/product-2.jpg"]),
        "Famous for its sheer texture, light weight, and luxurious feel, this Chanderi saree boasts intricate hand-block prints framed with a gleaming zari border.",
        JSON.stringify([
          "Featherlight gossamer handloom drape",
          "Natural dye print with subtle metallic sheen",
          "Versatile styling for daylight and evening affairs"
        ]),
        "An embodiment of subtle glamour and regal lineage. Ideal for festive pujas, garden soirees, and intimate gatherings.",
        "Chanderi Cotton-Silk Blend",
        "6.3 Meters with contrast blouse piece",
        "Dry clean first wash. Hand wash delicately with cold water."
      ],
      [
        "Pure Cotton Handloom Saree",
        "Pure Cotton",
        "₹ 2,450",
        26,
        "Published",
        "/images/product-4.jpg",
        JSON.stringify(["/images/product-1.jpg"]),
        "Handcrafted by skilled weavers, this pure breathable cotton saree brings cool comfort, vibrant earthy tones, and understated charm.",
        JSON.stringify([
          "100% combed organic handloom cotton",
          "High breathability and sweat-absorbent texture",
          "Classic temple border detailing"
        ]),
        "Effortlessly stylish and deeply connected to traditional handloom roots. Perfect for work wear, casual festivities, and cultural events.",
        "100% Handloom Organic Cotton",
        "6.2 Meters with unstitched blouse piece",
        "Hand wash separately in cold water with mild liquid soap."
      ],
      [
        "Thoranam Exclusive Zari Weave",
        "Thoranam Collection",
        "₹ 8,990",
        9,
        "Published",
        "/images/bestseller-1.jpg",
        JSON.stringify(["/images/bestseller-2.jpg", "/images/product-3.jpg"]),
        "A flagship creation from the Thoranam private archive. Rich dual-tone drape accented with intricate floral creeper motifs meticulously handwoven on jacquard looms.",
        JSON.stringify([
          "Exclusive boutique design pattern",
          "Double warp weave ensuring durability and sheen",
          "Signature Thoranam handcrafted border"
        ]),
        "The pinnacle of bespoke boutique elegance. Designed for high-profile gatherings and gala celebrations where timeless allure is paramount.",
        "Artisanal Silk-Cotton with Gold & Silver Zari",
        "6.4 Meters including heavy designer blouse piece",
        "Professional Dry Clean Only."
      ]
    ];

    for (const p of seedProducts) {
      await db.query(
        `INSERT INTO \`products\` 
          (title, category, price, stock, status, main_image, gallery_images, description, highlights, closing_description, material, size, wash_care)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        p
      );
    }
  }

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
