import { RowDataPacket } from 'mysql2';
import { query, execute } from '../../../infrastructure/database/query';
import { ROLES } from '../../../shared/constants';
import { hashPassword, comparePassword } from '../../../shared/utils/bcrypt';
import type { UpdateUserDto, UpdateRoleDto } from '../dto/users.dto';

// Roles que solo pueden tener 1 usuario activo en todo el sistema
const ROLES_UNICOS_GLOBALES = [ROLES.BOMBERO, ROLES.POLICIA, ROLES.PARAMEDICO];

interface UsuarioRow extends RowDataPacket {
  id_usuario: string;
  nombre: string;
  correo: string;
  id_rol: string;
  nombre_rol: string;
  localidad: string | null;
  fecha_registro: string;
  estado: number;
  avatar_seed: string | null;
}

interface RolRow extends RowDataPacket {
  id_rol: string;
  nombre_rol: string;
}

interface ContrasenaRow extends RowDataPacket {
  contrasena: string;
}

const SELECT_USUARIO = `
  SELECT u.id_usuario, u.nombre, u.correo, u.id_rol, r.nombre_rol,
         u.localidad, u.fecha_registro, u.estado, u.avatar_seed
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
  if (dto.telefono !== undefined) {
    fields.push('telefono = ?');
    values.push(dto.telefono);
  }
  if (dto.contrasena !== undefined) {
    if (!dto.contrasena_actual) throw new Error('La contraseña actual es requerida');
    const hashRows = await query<ContrasenaRow[]>(
      'SELECT contrasena FROM usuarios WHERE id_usuario = ?',
      [id]
    );
    if (!hashRows[0]) throw new Error('Usuario no encontrado');
    const valid = await comparePassword(dto.contrasena_actual, hashRows[0].contrasena);
    if (!valid) throw new Error('La contraseña actual es incorrecta');
    fields.push('contrasena = ?');
    values.push(await hashPassword(dto.contrasena));
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
  // Verificar que el rol existe y obtener su nombre
  const roles = await query<RolRow[]>(
    'SELECT id_rol, nombre_rol FROM roles WHERE id_rol = ?',
    [dto.id_rol]
  );
  if (roles.length === 0) throw new Error('Rol no encontrado');

  const nuevoRol = roles[0].nombre_rol;

  // Obtener el usuario que se va a modificar
  const usuarioRows = await query<UsuarioRow[]>(
    `${SELECT_USUARIO} WHERE u.id_usuario = ?`, [id]
  );
  if (usuarioRows.length === 0) throw new Error('Usuario no encontrado');
  const usuario = usuarioRows[0];

  // ── Validación: roles únicos globales (Bombero, Policía, Paramédico) ────────
  if (ROLES_UNICOS_GLOBALES.includes(nuevoRol as any)) {
    const activos = await query<UsuarioRow[]>(
      `${SELECT_USUARIO} WHERE r.nombre_rol = ? AND u.estado = TRUE AND u.id_usuario != ?`,
      [nuevoRol, id]
    );
    if (activos.length > 0) {
      throw new Error(
        `Ya existe un usuario activo con el rol ${nuevoRol}. Desactívalo antes de asignar otro.`
      );
    }
  }

  // ── Validación: máximo 1 Representante activo por localidad ─────────────────
  if (nuevoRol === ROLES.REPRESENTANTE) {
    if (!usuario.localidad) {
      throw new Error('El usuario no tiene localidad asignada');
    }
    const activos = await query<UsuarioRow[]>(
      `${SELECT_USUARIO} WHERE r.nombre_rol = ? AND u.localidad = ? AND u.estado = TRUE AND u.id_usuario != ?`,
      [nuevoRol, usuario.localidad, id]
    );
    if (activos.length > 0) {
      throw new Error(
        `Ya existe un Representante activo en ${usuario.localidad}. Desactívalo antes de asignar otro.`
      );
    }
  }

  await execute('UPDATE usuarios SET id_rol = ? WHERE id_usuario = ?', [dto.id_rol, id]);

  const rows = await query<UsuarioRow[]>(`${SELECT_USUARIO} WHERE u.id_usuario = ?`, [id]);
  return rows[0] ?? null;
};

export const deactivateUserService = async (id: string) => {
  await execute('UPDATE usuarios SET estado = FALSE WHERE id_usuario = ?', [id]);
};

export const toggleUserStatusService = async (id: string, estado: boolean) => {
  await execute('UPDATE usuarios SET estado = ? WHERE id_usuario = ?', [estado, id]);
  const rows = await query<UsuarioRow[]>(`${SELECT_USUARIO} WHERE u.id_usuario = ?`, [id]);
  return rows[0] ?? null;
};

export const updateAvatarService = async (id: string, seed: string) => {
  await execute('UPDATE usuarios SET avatar_seed = ? WHERE id_usuario = ?', [seed, id]);
  const rows = await query<UsuarioRow[]>(`${SELECT_USUARIO} WHERE u.id_usuario = ?`, [id]);
  return rows[0] ?? null;
};
