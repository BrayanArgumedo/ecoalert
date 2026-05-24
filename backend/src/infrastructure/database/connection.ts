import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'ecoalert_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // SSL requerido para Aiven y otros proveedores en la nube
  ...(process.env.DB_SSL === 'true' && {
    ssl: { rejectUnauthorized: false },
  }),
});
