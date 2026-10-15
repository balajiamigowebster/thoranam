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
  if (!isSynced) {
    try {
      await sequelize.authenticate();
      // alter: true safely modifies tables to match models without dropping data
      await sequelize.sync({ alter: false, ...options });
      isSynced = true;
      console.log("Sequelize: All models synchronized with MySQL successfully.");
    } catch (error) {
      console.error("Sequelize sync error:", error);
      throw error;
    }
  }
  return { sequelize, Product, Category, Order, Customer, Promotion, StoreSetting, AdminUser };
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
