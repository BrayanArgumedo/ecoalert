import { RowDataPacket } from 'mysql2';
import { query, execute } from '../../../infrastructure/database/query';
import type { CreateEmergencyTypeDto, UpdateEmergencyTypeDto } from '../dto/emergency-types.dto';

interface TipoEmergenciaRow extends RowDataPacket {
  id_tipo: string;
  nombre: string;
  descripcion: string | null;
  icono: string | null;
}

export const getAllTypesService = async () => {
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

export const createTypeService = async (dto: CreateEmergencyTypeDto) => {
  const existing = await query<TipoEmergenciaRow[]>(
    'SELECT id_tipo FROM tipos_emergencia WHERE nombre = ?',
    [dto.nombre]
  );
  if (existing.length > 0) {
    throw new Error('Ya existe un tipo de emergencia con ese nombre');
  }

  await execute(
    'INSERT INTO tipos_emergencia (nombre, descripcion, icono) VALUES (?, ?, ?)',
    [dto.nombre, dto.descripcion ?? null, dto.icono ?? null]
  );

  const rows = await query<TipoEmergenciaRow[]>(
    'SELECT id_tipo, nombre, descripcion, icono FROM tipos_emergencia WHERE nombre = ?',
    [dto.nombre]
  );
  return rows[0];
};

export const updateTypeService = async (id: string, dto: UpdateEmergencyTypeDto) => {
  const fields: string[] = [];
  const values: (string | null)[] = [];

  if (dto.nombre !== undefined) { fields.push('nombre = ?'); values.push(dto.nombre); }
  if (dto.descripcion !== undefined) { fields.push('descripcion = ?'); values.push(dto.descripcion); }
  if (dto.icono !== undefined) { fields.push('icono = ?'); values.push(dto.icono); }

  if (fields.length === 0) throw new Error('No hay campos para actualizar');

  values.push(id);
  await execute(`UPDATE tipos_emergencia SET ${fields.join(', ')} WHERE id_tipo = ?`, values);

  const rows = await query<TipoEmergenciaRow[]>(
    'SELECT id_tipo, nombre, descripcion, icono FROM tipos_emergencia WHERE id_tipo = ?',
    [id]
  );
  return rows[0] ?? null;
};

export const deleteTypeService = async (id: string) => {
  await execute('DELETE FROM tipos_emergencia WHERE id_tipo = ?', [id]);
};
