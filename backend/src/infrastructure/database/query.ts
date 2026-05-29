// src/infrastructure/database/query.ts
// Funciones genéricas que abstraen el acceso a la base de datos.
// Todo el código de servicios usa estas dos funciones en lugar de
// llamar al pool directamente, lo que centraliza el manejo de queries.

import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from './connection';

/**
 * Ejecuta un SELECT y retorna las filas resultantes.
 *
 * El genérico <T> permite tipar el resultado en cada servicio,
 * por ejemplo: query<Usuario[]>('SELECT * FROM usuarios').
 *
 * @param sql    - Sentencia SQL con placeholders (?)
 * @param params - Valores que reemplazan los placeholders (previene SQL injection)
 * @returns      - Array de filas tipadas como T
 */
export async function query<T extends RowDataPacket[]>(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<T> {
  const [rows] = await pool.execute<T>(sql, params);
  return rows;
}

/**
 * Ejecuta un INSERT, UPDATE o DELETE y retorna el resultado de la operación.
 *
 * ResultSetHeader contiene: affectedRows, insertId, changedRows, etc.
 *
 * @param sql    - Sentencia SQL con placeholders (?)
 * @param params - Valores que reemplazan los placeholders
 * @returns      - Metadata de la operación ejecutada
 */
export async function execute(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<ResultSetHeader> {
  const [result] = await pool.execute<ResultSetHeader>(sql, params);
  return result;
}
