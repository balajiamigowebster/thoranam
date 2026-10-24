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
      // Synchronize models without blocking alter unless explicitly requested
      if (options.alter) {
        await sequelize.sync({ alter: true, ...options });
      } else {
        await sequelize.sync();
      }

      // Explicit fail-safe for cPanel MySQL environments:
      try {
        await sequelize.query(`
          ALTER TABLE products ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0;
        `);
      } catch (colErr) {}

      try {
        await sequelize.query(`
          ALTER TABLE products MODIFY COLUMN main_image LONGTEXT;
        `);
        await sequelize.query(`
          ALTER TABLE products MODIFY COLUMN gallery_images LONGTEXT;
        `);
      } catch (modErr) {}

      isSynced = true;
      console.log("Sequelize: All models synchronized with MySQL successfully.");
    } catch (error) {
      console.error("Sequelize sync error:", error);
      try {
        await sequelize.sync();
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
