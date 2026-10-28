import { Sequelize } from "sequelize";
import mysql2 from "mysql2";

// Singleton sequelize instance across hot-reloads
let sequelizeInstance = null;

export function resetSequelize() {
  if (sequelizeInstance) {
    try {
      sequelizeInstance.close();
    } catch (e) {}
    sequelizeInstance = null;
  }
}

// Global safety timeout wrapper to ensure NO remote query can stall the serverless runtime
export async function withTimeout(promise, ms = 12000, fallback = null) {
  let timer;
  const timeoutPromise = new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      if (fallback !== null) {
        resolve(fallback);
      } else {
        reject(new Error(`Database operation timed out after ${ms}ms`));
      }
    }, ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

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
        max: 5,
        min: 0,
        acquire: 15000,
        idle: 5000,
        evict: 5000,
      },
      retry: {
        max: 3,
      },
      dialectOptions: {
        connectTimeout: 10000,

        enableKeepAlive: true,
        keepAliveInitialDelay: 5000,
      },
    });
  }
  return sequelizeInstance;
}

export default getSequelize;
