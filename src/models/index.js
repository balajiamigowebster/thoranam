import getSequelize from "@/lib/sequelize";
import Product from "./Product";
import Category from "./Category";
import Order from "./Order";
import Customer from "./Customer";
import Promotion from "./Promotion";
import StoreSetting from "./StoreSetting";
import AdminUser from "./AdminUser";

let isSynced = false;

// Sync all models with MySQL database
export async function syncDatabase(options = {}) {
  const sequelize = getSequelize();
  
  // Explicitly reference all models so Sequelize registers their schemas
  const models = {
    Product,
    Category,
    Order,
    Customer,
    Promotion,
    StoreSetting,
    AdminUser,
  };

  if (isSynced && !options.force && !options.alter) {
    return;
  }

  if (!isSynced || options.force || options.alter) {
    try {
      await sequelize.authenticate();
      // Synchronize all registered models with database
      await sequelize.sync({ alter: true, ...options });

      // Explicit fail-safe for cPanel MySQL environments where sync({ alter: true }) skips silently:
      try {
        await sequelize.query(`
          ALTER TABLE products ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0;
        `);
      } catch (colErr) {
        // If column already exists (Error 1060: Duplicate column name), that's expected and safe
      }

      try {
        await sequelize.query(`
          ALTER TABLE products MODIFY COLUMN main_image TEXT;
        `);
      } catch (modErr) {}

      isSynced = true;
      console.log("Sequelize: All models synchronized with MySQL successfully.");
    } catch (error) {
      console.error("Sequelize sync error:", error);
      // Fallback without alter if alter is restricted by DB user permissions
      try {
        await sequelize.sync();

        // Still attempt safe column addition in fallback mode
        try {
          await sequelize.query(`
            ALTER TABLE products ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0;
          `);
        } catch (colErr) {}

        isSynced = true;
      } catch (innerErr) {
        console.error("Sequelize fallback sync error:", innerErr);
        throw error;
      }
    }
  }
  return { sequelize, ...models };
}

export {
  getSequelize,
  Product,
  Category,
  Order,
  Customer,
  Promotion,
  StoreSetting,
  AdminUser,
};
