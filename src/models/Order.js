import { DataTypes } from "sequelize";
import getSequelize from "@/lib/sequelize";

const sequelize = getSequelize();

export const Order = sequelize.isDefined("Order")
  ? sequelize.model("Order")
  : sequelize.define(
      "Order",
      {
        id: {
          type: DataTypes.STRING(50),
          primaryKey: true,
        },
        customer_name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        customer_email: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        customer_phone: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        total_amount: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        items_count: {
          type: DataTypes.INTEGER,
          defaultValue: 1,
        },
        payment_status: {
          type: DataTypes.ENUM("Paid", "Pending", "Failed"),
          defaultValue: "Paid",
        },
        order_status: {
          type: DataTypes.ENUM("New", "Processing", "Shipped", "Delivered", "Cancelled"),
          defaultValue: "New",
        },
        shipping_address: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        items_details: {
          type: DataTypes.JSON,
          allowNull: true,
        },
      },
      {
        tableName: "orders",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );

export default Order;
