// src/config.ts
// Centraliza todas las variables de entorno del sistema en un objeto tipado.
// El resto del código importa desde aquí en lugar de leer process.env directamente.

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Entorno de ejecución: 'development' en local, 'production' en Render
  env: process.env.NODE_ENV || 'development',

  // Puerto del servidor. Render asigna el suyo via PORT en producción
  port: Number(process.env.PORT) || 3000,

  // ── Base de datos ────────────────────────────────────────────────────────
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    name: process.env.DB_NAME || 'ecoalert_db',
  },

  // ── JWT ──────────────────────────────────────────────────────────────────
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret',           // Firma del access token (24h)
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret', // Firma del refresh token (7d)
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // ── Bcrypt ───────────────────────────────────────────────────────────────
  bcrypt: {
    // A mayor número de rondas, más seguro pero más lento. 12 es el estándar recomendado.
    saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  },
};
