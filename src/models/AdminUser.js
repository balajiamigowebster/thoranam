import { DataTypes } from "sequelize";
import getSequelize from "@/lib/sequelize";

const sequelize = getSequelize();

export const AdminUser = sequelize.isDefined("AdminUser")
  ? sequelize.model("AdminUser")
  : sequelize.define(
      "AdminUser",
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
        },
        name: {
          type: DataTypes.STRING(150),
          allowNull: true,
          defaultValue: "Boutique Administrator",
        },
        password_hash: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        role: {
          type: DataTypes.STRING(50),
          defaultValue: "superadmin",
        },
        last_login: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        tableName: "admin_users",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );

export default AdminUser;
