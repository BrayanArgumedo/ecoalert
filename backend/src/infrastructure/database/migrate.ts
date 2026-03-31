import { readFileSync } from 'fs';
import { join } from 'path';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const MIGRATIONS_DIR = join(__dirname, 'migrations');

const migrationFiles = [
  '001_create_roles.sql',
  '002_create_usuarios.sql',
  '003_create_tipos_emergencia.sql',
  '004_create_incidencias.sql',
  '005_create_servicios_publicos.sql',
  '006_create_incidencia_servicios.sql',
  '007_create_historial_estados.sql',
  '008_seed_data.sql',
];

async function runMigrations(): Promise<void> {
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
      const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');
      await connection.query(sql);
      console.log(`✓ ${file}`);
    }

    // Buscar el UUID del rol Admin para insertarlo en el usuario
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT id_rol FROM roles WHERE nombre_rol = 'Admin' LIMIT 1`
    );

    if (rows.length === 0) {
      throw new Error('Rol Admin no encontrado. Verifica el seed de roles.');
    }

    const adminRoleId = rows[0].id_rol as string;
    const hash = await bcrypt.hash('Admin123!', 12);

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
    await connection.end();
  }
}

runMigrations();
