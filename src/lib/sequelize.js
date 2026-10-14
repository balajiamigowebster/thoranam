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
        logging: process.env.NODE_ENV === "development" ? false : false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      }
    );
  }
  return sequelizeInstance;
}

export default getSequelize;
