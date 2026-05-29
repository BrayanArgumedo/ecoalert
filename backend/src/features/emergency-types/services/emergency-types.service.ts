// src/features/emergency-types/services/emergency-types.service.ts
// Lógica de negocio del módulo de tipos de emergencia.
// Gestiona el catálogo de tipos que el usuario selecciona al reportar
// una incidencia (p. ej. Inundación, Incendio, Derrame químico).

import { RowDataPacket } from 'mysql2';
import { query, execute } from '../../../infrastructure/database/query';
import type { CreateEmergencyTypeDto, UpdateEmergencyTypeDto } from '../dto/emergency-types.dto';

interface TipoEmergenciaRow extends RowDataPacket {
  id_tipo: string;
  nombre: string;
  descripcion: string | null;
  icono: string | null;  // Nombre del ícono usado por el mobile (p. ej. 'flame', 'water')
}

// ── Consultas de lectura ──────────────────────────────────────────────────────

export const getAllTypesService = async () => {
  // Orden alfabético para que el selector del mobile sea más fácil de navegar
  return query<TipoEmergenciaRow[]>(
    'SELECT id_tipo, nombre, descripcion, icono FROM tipos_emergencia ORDER BY nombre'
  );
};

export const getTypeByIdService = async (id: string) => {
  const rows = await query<TipoEmergenciaRow[]>(
    'SELECT id_tipo, nombre, descripcion, icono FROM tipos_emergencia WHERE id_tipo = ?',
    [id]
  );
  return rows[0] ?? null;
};

// ── Crear tipo ────────────────────────────────────────────────────────────────

export const createTypeService = async (dto: CreateEmergencyTypeDto) => {
  // 1. Verificar que no exista otro tipo con el mismo nombre
  const existing = await query<TipoEmergenciaRow[]>(
    'SELECT id_tipo FROM tipos_emergencia WHERE nombre = ?',
    [dto.nombre]
  );
  if (existing.length > 0) {
    throw new Error('Ya existe un tipo de emergencia con ese nombre');
  }

  // 2. Insertar el nuevo tipo (descripción e ícono son opcionales)
  await execute(
    'INSERT INTO tipos_emergencia (nombre, descripcion, icono) VALUES (?, ?, ?)',
    [dto.nombre, dto.descripcion ?? null, dto.icono ?? null]
  );

  // 3. Retornar el registro recién creado
  const rows = await query<TipoEmergenciaRow[]>(
    'SELECT id_tipo, nombre, descripcion, icono FROM tipos_emergencia WHERE nombre = ?',
    [dto.nombre]
  );
  return rows[0];
};

// ── Actualizar tipo ───────────────────────────────────────────────────────────

export const updateTypeService = async (id: string, dto: UpdateEmergencyTypeDto) => {
  // Construcción dinámica del SET: solo se actualizan los campos presentes en el dto
  const fields: string[] = [];
  const values: (string | null)[] = [];

  if (dto.nombre      !== undefined) { fields.push('nombre = ?');      values.push(dto.nombre); }
  if (dto.descripcion !== undefined) { fields.push('descripcion = ?'); values.push(dto.descripcion); }
  if (dto.icono       !== undefined) { fields.push('icono = ?');       values.push(dto.icono); }

  if (fields.length === 0) throw new Error('No hay campos para actualizar');

  values.push(id);
  await execute(`UPDATE tipos_emergencia SET ${fields.join(', ')} WHERE id_tipo = ?`, values);

  const rows = await query<TipoEmergenciaRow[]>(
    'SELECT id_tipo, nombre, descripcion, icono FROM tipos_emergencia WHERE id_tipo = ?',
    [id]
  );
  return rows[0] ?? null;
};

// ── Eliminar tipo ─────────────────────────────────────────────────────────────

// Eliminación física. Si existen incidencias que referencian este tipo,
// MySQL rechazará la operación por restricción de FK.
export const deleteTypeService = async (id: string) => {
  await execute('DELETE FROM tipos_emergencia WHERE id_tipo = ?', [id]);
};
