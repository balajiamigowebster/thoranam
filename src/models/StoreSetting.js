import { DataTypes } from "sequelize";
import getSequelize from "@/lib/sequelize";

const sequelize = getSequelize();

export const StoreSetting = sequelize.isDefined("StoreSetting")
  ? sequelize.model("StoreSetting")
  : sequelize.define(
      "StoreSetting",
      {
        setting_key: {
          type: DataTypes.STRING(100),
          primaryKey: true,
        },
        setting_value: {
          type: DataTypes.JSON,
          allowNull: true,
        },
      },
      {
        tableName: "store_settings",
        timestamps: true,
        createdAt: false,
        updatedAt: "updated_at",
      }
    );

export default StoreSetting;
