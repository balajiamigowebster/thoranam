import { DataTypes } from "sequelize";
import getSequelize from "@/lib/sequelize";

const sequelize = getSequelize();

export const Promotion = sequelize.isDefined("Promotion")
  ? sequelize.model("Promotion")
  : sequelize.define(
      "Promotion",
      {
        id: {
          type: DataTypes.STRING(50),
          primaryKey: true,
        },
        code: {
          type: DataTypes.STRING(50),
          unique: true,
          allowNull: false,
        },
        discount_type: {
          type: DataTypes.ENUM("percentage", "flat"),
          defaultValue: "percentage",
        },
        discount_value: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        min_order_value: {
          type: DataTypes.DECIMAL(10, 2),
          defaultValue: 0,
        },
        max_discount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
        expiry_date: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM("Active", "Expired", "Disabled"),
          defaultValue: "Active",
        },
      },
      {
        tableName: "promotions",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );

export default Promotion;
