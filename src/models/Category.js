import { DataTypes } from "sequelize";
import getSequelize from "@/lib/sequelize";

const sequelize = getSequelize();

export const Category = sequelize.isDefined("Category")
  ? sequelize.model("Category")
  : sequelize.define(
      "Category",
      {
        id: {
          type: DataTypes.STRING(100),
          primaryKey: true,
        },
        label: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        href: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        image: {
          type: DataTypes.STRING(500),
          allowNull: true,
          defaultValue: "",
        },
        sort_order: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        featured: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        subcategories: {
          type: DataTypes.JSON,
          allowNull: true,
          defaultValue: [],
        },
        showcase: {
          type: DataTypes.JSON,
          allowNull: true,
          defaultValue: [],
        },
      },
      {
        tableName: "categories",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );

export default Category;
