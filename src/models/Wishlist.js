import { DataTypes } from "sequelize";
import getSequelize from "@/lib/sequelize";

const sequelize = getSequelize();

export const Wishlist = sequelize.isDefined("Wishlist")
  ? sequelize.model("Wishlist")
  : sequelize.define(
      "Wishlist",
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        customer_id: {
          type: DataTypes.BIGINT,
          allowNull: true,
        },
        customer_email: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        product_id: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        product_title: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        product_price: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        product_image: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        product_category: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
      },
      {
        tableName: "customer_wishlists",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [
          {
            unique: true,
            fields: ["customer_email", "product_id"],
          },
          {
            fields: ["customer_email"],
          },
        ],
      }
    );

export default Wishlist;

