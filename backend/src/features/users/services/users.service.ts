// src/features/users/services/users.service.ts
// Lógica de negocio del módulo de usuarios.
// Gestiona consultas de perfil, actualización de datos, cambio de rol,
// activación/desactivación de cuentas y cambio de avatar.

import { RowDataPacket } from 'mysql2';
import { query, execute } from '../../../infrastructure/database/query';
import { ROLES } from '../../../shared/constants';
import { hashPassword, comparePassword } from '../../../shared/utils/bcrypt';
import type { UpdateUserDto, UpdateRoleDto } from '../dto/users.dto';

// Roles que solo pueden tener 1 usuario activo en todo el sistema.
// Si ya hay un Bombero activo, no se puede asignar ese rol a otro usuario
// hasta desactivar al actual.
const ROLES_UNICOS_GLOBALES = [ROLES.BOMBERO, ROLES.POLICIA, ROLES.PARAMEDICO];

// ── Tipos de las filas de BD ──────────────────────────────────────────────────

interface UsuarioRow extends RowDataPacket {
  id_usuario: string;
  nombre: string;
  correo: string;
  id_rol: string;
  nombre_rol: string;
  localidad: string | null;
  fecha_registro: string;
  estado: number;        // 1 = activo, 0 = desactivado
  avatar_seed: string | null;
}

interface RolRow extends RowDataPacket {
  id_rol: string;
  nombre_rol: string;
}

interface ContrasenaRow extends RowDataPacket {
  contrasena: string;    // Hash bcrypt — solo se usa para comparar, nunca se expone
}

// ── Query base reutilizable ───────────────────────────────────────────────────

// Fragmento SELECT compartido por todas las funciones del módulo.
// Incluye el JOIN con roles para obtener nombre_rol sin repetir la query.
const SELECT_USUARIO = `
  SELECT u.id_usuario, u.nombre, u.correo, u.id_rol, r.nombre_rol,
         u.localidad, u.fecha_registro, u.estado, u.avatar_seed
  FROM usuarios u
  JOIN roles r ON u.id_rol = r.id_rol
`;

// ── Consultas de lectura ──────────────────────────────────────────────────────

export const getAllUsersService = async () => {
  // Ordenado por fecha de registro descendente para mostrar los más recientes primero
  return query<UsuarioRow[]>(`${SELECT_USUARIO} ORDER BY u.fecha_registro DESC`);
};

export const getUserByIdService = async (id: string) => {
  const rows = await query<UsuarioRow[]>(
    `${SELECT_USUARIO} WHERE u.id_usuario = ?`,
    [id]
  );
  // Retorna null si no existe para que el controlador devuelva 404
  return rows[0] ?? null;
};

// ── Actualizar datos del usuario ──────────────────────────────────────────────

export const updateUserService = async (id: string, dto: UpdateUserDto) => {
  // Construcción dinámica del SET: solo se actualizan los campos presentes en el dto.
  // Esto permite que el cliente envíe solo los campos que desea cambiar (PATCH semántico).
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
    // Cambio de contraseña: requiere verificar la contraseña actual antes de reemplazarla
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

  // El ID va al final del array porque es el valor del WHERE
  values.push(id);
  await execute(`UPDATE usuarios SET ${fields.join(', ')} WHERE id_usuario = ?`, values);

  // Retorna el usuario actualizado con su rol para que el cliente refresque la sesión
  const rows = await query<UsuarioRow[]>(`${SELECT_USUARIO} WHERE u.id_usuario = ?`, [id]);
  return rows[0] ?? null;
};

// ── Cambiar rol de un usuario ─────────────────────────────────────────────────

export const updateUserRoleService = async (id: string, dto: UpdateRoleDto) => {
  // 1. Verificar que el rol destino existe y obtener su nombre
  const roles = await query<RolRow[]>(
    'SELECT id_rol, nombre_rol FROM roles WHERE id_rol = ?',
    [dto.id_rol]
  );
  if (roles.length === 0) throw new Error('Rol no encontrado');
  const nuevoRol = roles[0].nombre_rol;

  // 2. Obtener los datos actuales del usuario (necesitamos su localidad para Representante)
  const usuarioRows = await query<UsuarioRow[]>(
    `${SELECT_USUARIO} WHERE u.id_usuario = ?`, [id]
  );
  if (usuarioRows.length === 0) throw new Error('Usuario no encontrado');
  const usuario = usuarioRows[0];

  // 3. Validar unicidad global: Bombero, Policía y Paramédico admiten solo 1 activo
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

  // 4. Validar unicidad por localidad: solo 1 Representante activo por barrio/vereda
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

  // 5. Aplicar el cambio y retornar el usuario con el nuevo rol
  await execute('UPDATE usuarios SET id_rol = ? WHERE id_usuario = ?', [dto.id_rol, id]);
  const rows = await query<UsuarioRow[]>(`${SELECT_USUARIO} WHERE u.id_usuario = ?`, [id]);
  return rows[0] ?? null;
};

// ── Desactivar / activar cuenta ───────────────────────────────────────────────

// Desactivación directa: siempre pone estado = FALSE (usada por DELETE /users/:id)
export const deactivateUserService = async (id: string) => {
  await execute('UPDATE usuarios SET estado = FALSE WHERE id_usuario = ?', [id]);
};

// Activación o desactivación según el valor del parámetro (usada por PATCH /users/:id/status)
export const toggleUserStatusService = async (id: string, estado: boolean) => {
  await execute('UPDATE usuarios SET estado = ? WHERE id_usuario = ?', [estado, id]);
  const rows = await query<UsuarioRow[]>(`${SELECT_USUARIO} WHERE u.id_usuario = ?`, [id]);
  return rows[0] ?? null;
};

// ── Avatar ────────────────────────────────────────────────────────────────────

// El seed es una cadena que DiceBear usa para generar un avatar único y reproducible.
// El cliente elige el seed y el backend solo lo persiste.
export const updateAvatarService = async (id: string, seed: string) => {
  await execute('UPDATE usuarios SET avatar_seed = ? WHERE id_usuario = ?', [seed, id]);
  const rows = await query<UsuarioRow[]>(`${SELECT_USUARIO} WHERE u.id_usuario = ?`, [id]);
  return rows[0] ?? null;
};
