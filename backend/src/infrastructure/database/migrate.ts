// src/infrastructure/database/migrate.ts
// Script de migraciones que inicializa la base de datos del proyecto.
// Se ejecuta con: npm run migrate
// Crea las tablas, inserta los datos semilla y crea el usuario admin.
// Es idempotente: si una migración ya fue aplicada, la omite sin error.

import { readFileSync } from 'fs';
import { join } from 'path';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Ruta absoluta a la carpeta que contiene los archivos .sql
const MIGRATIONS_DIR = join(__dirname, 'migrations');

// Lista ordenada de migraciones. El orden es crítico por las foreign keys.
// Nunca reordenar ni eliminar archivos de esta lista.
const migrationFiles = [
  '001_create_roles.sql',
  '002_create_usuarios.sql',
  '003_create_tipos_emergencia.sql',
  '004_create_incidencias.sql',
  '005_create_servicios_publicos.sql',
  '006_create_incidencia_servicios.sql',
  '007_create_historial_estados.sql',
  '008_seed_data.sql',
  '009_add_telefono_usuarios.sql',
  '010_add_heridos_incidencias.sql',
  '011_add_avatar_seed_usuarios.sql',
  '012_add_aceptada_incidencia_servicios.sql',
];

async function runMigrations(): Promise<void> {
  // Usamos una conexión directa (no el pool) porque necesitamos
  // multipleStatements: true para ejecutar varios SQL en un mismo archivo.
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'ecoalert_db',
    multipleStatements: true,
  });

  try {
    console.log('🚀 Iniciando migraciones...\n');

    for (const file of migrationFiles) {
      try {
        // 1. Leer el archivo SQL como texto
        const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');

        // 2. Ejecutar todas las sentencias del archivo
        await connection.query(sql);
        console.log(`✓ ${file}`);

      } catch (err: any) {
        // Códigos de error que indican que la migración ya fue aplicada:
        // 1060 = columna duplicada | 1050 = tabla ya existe | 1091 = columna/índice no encontrado al hacer DROP
        if ([1060, 1050, 1091].includes(err.errno)) {
          console.log(`⚠ ${file} — ya aplicado, omitiendo`);
        } else {
          throw err; // Error inesperado: detener todo
        }
      }
    }

    // ── Crear usuario administrador ──────────────────────────────────────────

    // 1. Obtener el ID del rol Admin (generado dinámicamente por el seed)
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT id_rol FROM roles WHERE nombre_rol = 'Admin' LIMIT 1`
    );

    if (rows.length === 0) {
      throw new Error('Rol Admin no encontrado. Verifica el seed de roles.');
    }

    const adminRoleId = rows[0].id_rol as string;

    // 2. Hashear la contraseña con bcrypt (12 rondas)
    const hash = await bcrypt.hash('Admin123!', 12);

    // 3. Insertar el admin. INSERT IGNORE evita error si ya existe.
    await connection.execute(
      `INSERT IGNORE INTO usuarios (nombre, correo, contrasena, id_rol, localidad)
       VALUES (?, ?, ?, ?, 'Sistema')`,
      ['Administrador', 'admin@ecoalert.com', hash, adminRoleId]
    );
    console.log('✓ Usuario admin creado: admin@ecoalert.com / Admin123!');

    console.log('\n✅ Migraciones completadas exitosamente.');

  } catch (error) {
    console.error('\n❌ Error en migración:', error);
    process.exit(1);
  } finally {
    // Siempre cerrar la conexión aunque ocurra un error
    await connection.end();
  }
}

runMigrations();
