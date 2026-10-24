// Optional custom server script for cPanel Node.js Application deployment
// This acts as the Application Startup File (e.g., server.js) in cPanel "Setup Node.js App"

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const fs = require("fs");
const path = require("path");

// Auto-detect production build: if .next/BUILD_ID doesn't exist (e.g. fresh cPanel pull), fallback to dev mode to prevent 503 crash
const hasProductionBuild = fs.existsSync(path.join(__dirname, ".next", "BUILD_ID"));
const dev = !hasProductionBuild || process.env.NODE_ENV === "development";
const hostname = "localhost";
const port = process.env.PORT || 3000;

console.log(`[Server] Starting Next.js app (dev mode: ${dev}, hasProductionBuild: ${hasProductionBuild})`);

// Direct Database Synchronizer (Runs on server startup in cPanel)
async function ensureTablesExist() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "thoranam-db",
    });

    console.log("[DB Startup] Connected to MySQL. Ensuring all tables exist...");

    // 1. admin_users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`admin_users\` (
        \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` VARCHAR(100) NOT NULL UNIQUE,
        \`name\` VARCHAR(150) DEFAULT 'Boutique Administrator',
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(50) DEFAULT 'superadmin',
        \`last_login\` DATETIME NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. customers
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`customers\` (
        \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`phone\` VARCHAR(50) NULL,
        \`total_orders\` INT DEFAULT 0,
        \`total_spent\` VARCHAR(50) DEFAULT '₹ 0',
        \`last_order_date\` DATE NULL,
        \`status\` ENUM('Active', 'Inactive', 'VIP') DEFAULT 'Active',
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. promotions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`promotions\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`code\` VARCHAR(50) NOT NULL UNIQUE,
        \`discount_type\` ENUM('percentage', 'flat') DEFAULT 'percentage',
        \`discount_value\` DECIMAL(10, 2) NOT NULL,
        \`min_order_value\` DECIMAL(10, 2) DEFAULT 0,
        \`max_discount\` DECIMAL(10, 2) NULL,
        \`expiry_date\` DATE NULL,
        \`status\` ENUM('Active', 'Expired', 'Disabled') DEFAULT 'Active',
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. store_settings
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`store_settings\` (
        \`setting_key\` VARCHAR(100) PRIMARY KEY,
        \`setting_value\` JSON NULL,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Seed default admin credentials if admin_users is empty
    const [rows] = await connection.query("SELECT COUNT(*) as count FROM `admin_users`");
    if (rows[0].count === 0) {
      const adminUserId = process.env.ADMIN_USER_ID || "admin";
      const adminPassword = process.env.ADMIN_PASSWORD || "admin";
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(adminPassword, salt);
      await connection.query(
        "INSERT INTO `admin_users` (`user_id`, `name`, `password_hash`, `role`) VALUES (?, ?, ?, ?)",
        [adminUserId, "Thoranam Administrator", hash, "superadmin"]
      );
      console.log(`[DB Startup] Seeded default admin user '${adminUserId}'`);
    }

    await connection.end();
    console.log("[DB Startup] All 7 tables verified and created successfully!");
  } catch (err) {
    console.error("[DB Startup Warning] Could not ensure tables:", err.message);
  }
}

// Turbopack requires native binary bindings not available on cPanel Linux/x64.
// Force Webpack mode so Next.js runs seamlessly in dev mode without native binding crashes.
delete process.env.TURBOPACK;
const app = next({ dev, hostname, port, webpack: true });
const handle = app.getRequestHandler();

const ALLOWED_ORIGINS = [
  "https://thoranam.co",
  "https://www.thoranam.co",
  "https://thoranam-olive.vercel.app",
  "http://localhost:3000",
];

app.prepare().then(async () => {
  await ensureTablesExist();

  createServer(async (req, res) => {
    try {
      const origin = req.headers.origin;

      // Enable CORS for frontend applications (Vercel, Live domains, Localhost)
      if (origin && (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes(origin.replace(/\/$/, "")))) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        );
        res.setHeader(
          "Access-Control-Allow-Headers",
          "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
        );
      }

      // Handle preflight OPTIONS requests
      if (req.method === "OPTIONS") {
        res.statusCode = 200;
        res.end();
        return;
      }

      // Handle subpath prefix if deployed under /thoranam in cPanel
      if (req.url === "/thoranam") {
        req.url = "/";
      } else if (req.url.startsWith("/thoranam/")) {
        req.url = req.url.replace(/^\/thoranam/, "");
      }

      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Allowed Live Origins:`, ALLOWED_ORIGINS);
  });
}).catch((err) => {
  console.error("[CRITICAL Startup Error] Next.js failed to prepare:", err);
  // Fallback server to prevent LiteSpeed 503 Service Unavailable crash
  createServer((req, res) => {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.end(JSON.stringify({ 
      error: "Thoranam Server Initialization Error", 
      message: err.message,
      suggestion: "Please check stderr.log or run in development mode."
    }));
  }).listen(port, () => {
    console.log(`[Emergency Server] Listening on http://${hostname}:${port}`);
  });
});
