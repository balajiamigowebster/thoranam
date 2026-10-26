import { Sequelize } from "sequelize";
import mysql2 from "mysql2";

// Singleton sequelize instance across hot-reloads
let sequelizeInstance = null;

export function getSequelize() {
  if (!sequelizeInstance) {
    const dbName = process.env.DB_NAME || "amigoweb_thoranam-db";
    const dbUser = process.env.DB_USER || "amigoweb_thoranam-user";
    const dbPassword =
      process.env.DB_PASSWORD !== undefined && process.env.DB_PASSWORD !== ""
        ? process.env.DB_PASSWORD
        : "Thoranam-password-12";
    const dbHost = process.env.DB_HOST || "amigowebster.in";
    const dbPort = Number(process.env.DB_PORT) || 3306;

    sequelizeInstance = new Sequelize(dbName, dbUser, dbPassword, {
      host: dbHost,
      port: dbPort,
      dialect: "mysql",
      dialectModule: mysql2,
      logging: false,
      pool: {
        max: 3,
        min: 0,
        acquire: 5000,
        idle: 2000,
        evict: 2000,
      },
      retry: {
        max: 2,
      },
      dialectOptions: {
        connectTimeout: 5000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      },
    });
  }
  return sequelizeInstance;
}

export default getSequelize;
