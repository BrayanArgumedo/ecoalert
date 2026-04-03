import { RowDataPacket } from 'mysql2';
import { query, execute } from '../../../infrastructure/database/query';
import type { UpdateUserDto, UpdateRoleDto } from '../dto/users.dto';

interface UsuarioRow extends RowDataPacket {
  id_usuario: string;
  nombre: string;
  correo: string;
  id_rol: string;
  nombre_rol: string;
  localidad: string | null;
  fecha_registro: string;
  estado: number;
}

interface RolRow extends RowDataPacket {
  id_rol: string;
  nombre_rol: string;
}

const SELECT_USUARIO = `
  SELECT u.id_usuario, u.nombre, u.correo, u.id_rol, r.nombre_rol,
         u.localidad, u.fecha_registro, u.estado
  FROM usuarios u
  JOIN roles r ON u.id_rol = r.id_rol
`;

export const getAllUsersService = async () => {
  return query<UsuarioRow[]>(`${SELECT_USUARIO} ORDER BY u.fecha_registro DESC`);
};

export const getUserByIdService = async (id: string) => {
  const rows = await query<UsuarioRow[]>(
    `${SELECT_USUARIO} WHERE u.id_usuario = ?`,
    [id]
  );
  return rows[0] ?? null;
};

export const updateUserService = async (id: string, dto: UpdateUserDto) => {
  const fields: string[] = [];
  const values: (string | null)[] = [];

  if (dto.nombre !== undefined) {
    fields.push('nombre = ?');
    values.push(dto.nombre);
  }
  if (dto.localidad !== undefined) {
    fields.push('localidad = ?');
    values.push(dto.localidad);
  }

  if (fields.length === 0) {
    throw new Error('No hay campos para actualizar');
  }

  values.push(id);
  await execute(`UPDATE usuarios SET ${fields.join(', ')} WHERE id_usuario = ?`, values);

  const rows = await query<UsuarioRow[]>(`${SELECT_USUARIO} WHERE u.id_usuario = ?`, [id]);
  return rows[0] ?? null;
};

export const updateUserRoleService = async (id: string, dto: UpdateRoleDto) => {
  // Verificar que el rol existe
  const roles = await query<RolRow[]>(
    'SELECT id_rol FROM roles WHERE id_rol = ?',
    [dto.id_rol]
  );
  if (roles.length === 0) {
    throw new Error('Rol no encontrado');
  }

  await execute('UPDATE usuarios SET id_rol = ? WHERE id_usuario = ?', [dto.id_rol, id]);

  const rows = await query<UsuarioRow[]>(`${SELECT_USUARIO} WHERE u.id_usuario = ?`, [id]);
  return rows[0] ?? null;
};

export const deactivateUserService = async (id: string) => {
  await execute('UPDATE usuarios SET estado = FALSE WHERE id_usuario = ?', [id]);
};
