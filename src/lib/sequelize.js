import { Sequelize } from "sequelize";
import mysql2 from "mysql2";

// Singleton sequelize instance across hot-reloads
let sequelizeInstance = null;

export function getSequelize() {
  if (!sequelizeInstance) {
    sequelizeInstance = new Sequelize(
      process.env.DB_NAME || "thoranam-db",
      process.env.DB_USER || "root",
      process.env.DB_PASSWORD ?? "",
      {
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT) || 3306,
        dialect: "mysql",
        dialectModule: mysql2,
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 4000,
          idle: 5000,
        },
        retry: {
          max: 1,
        },
        dialectOptions: {
          connectTimeout: 3000,
        },
      }
    );
  }
  return sequelizeInstance;
}

export default getSequelize;
