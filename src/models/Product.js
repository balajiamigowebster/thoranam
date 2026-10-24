import { DataTypes } from "sequelize";
import getSequelize from "@/lib/sequelize";

const sequelize = getSequelize();

if (sequelize.isDefined("Product")) {
  delete sequelize.models.Product;
}

export const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        category: {
          type: DataTypes.STRING(150),
          allowNull: false,
        },
        price: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        stock: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        status: {
          type: DataTypes.ENUM("Published", "Low Stock", "Draft"),
          defaultValue: "Published",
        },
        main_image: {
          type: DataTypes.TEXT("long"),
          allowNull: true,
          defaultValue: "/images/product-1.jpg",
        },
        gallery_images: {
          type: DataTypes.TEXT("long"),
          allowNull: true,
          defaultValue: "[]",
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        highlights: {
          type: DataTypes.JSON,
          allowNull: true,
          defaultValue: [],
        },
        closing_description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        material: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        size: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        wash_care: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        seo_title: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        seo_description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        seo_keywords: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        og_image: {
          type: DataTypes.TEXT("long"),
          allowNull: true,
        },
        is_featured: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        tableName: "products",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );

export default Product;
