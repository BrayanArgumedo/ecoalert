// src/infrastructure/database/connection.ts
// Crea y exporta el pool de conexiones MySQL que usa toda la aplicación.
// Un pool reutiliza conexiones abiertas en lugar de abrir y cerrar una
// por cada query, lo que mejora significativamente el rendimiento.

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'ecoalert_db',

  // Si no hay conexiones disponibles, las peticiones esperan en cola
  waitForConnections: true,

  // Máximo de conexiones simultáneas abiertas al mismo tiempo
  connectionLimit: 10,

  // 0 = sin límite de peticiones en espera cuando el pool está lleno
  queueLimit: 0,

  // SSL requerido para Aiven en producción (DB_SSL=true en .env).
  // rejectUnauthorized: false acepta el certificado autofirmado de Aiven.
  ...(process.env.DB_SSL === 'true' && {
    ssl: { rejectUnauthorized: false },
  }),
});
