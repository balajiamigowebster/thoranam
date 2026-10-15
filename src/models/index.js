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

  if (!isSynced || options.force) {
    try {
      await sequelize.authenticate();
      // Synchronize all registered models with database (creates non-existent tables)
      await sequelize.sync({ alter: false, ...options });
      isSynced = true;
      console.log("Sequelize: All 7 models synchronized with MySQL successfully.");
    } catch (error) {
      console.error("Sequelize sync error:", error);
      throw error;
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
