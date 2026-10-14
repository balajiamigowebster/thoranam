import { DataTypes } from "sequelize";
import getSequelize from "@/lib/sequelize";

const sequelize = getSequelize();

export const Customer = sequelize.isDefined("Customer")
  ? sequelize.model("Customer")
  : sequelize.define(
      "Customer",
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(255),
          unique: true,
          allowNull: false,
        },
        phone: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        total_orders: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        total_spent: {
          type: DataTypes.STRING(50),
          defaultValue: "₹ 0",
        },
        last_order_date: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM("Active", "Inactive", "VIP"),
          defaultValue: "Active",
        },
      },
      {
        tableName: "customers",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );

export default Customer;
