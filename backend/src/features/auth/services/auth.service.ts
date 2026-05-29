// src/features/auth/services/auth.service.ts
// Lógica de negocio del módulo de autenticación.
// Aquí viven las reglas: validar correo único, asignar rol por defecto,
// verificar contraseña, generar tokens y controlar el estado de la cuenta.

import { randomUUID } from 'crypto';
import { RowDataPacket } from 'mysql2';
import { query } from '../../../infrastructure/database/query';
import { hashPassword, comparePassword } from '../../../shared/utils/bcrypt';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../../shared/utils/jwt';
import { ROLES } from '../../../shared/constants';
import { LOCALIDADES_CERETE } from '../../../shared/constants/localidades';
import type { RegisterDto, LoginDto, RefreshDto } from '../dto/auth.dto';

// Tipado del resultado de las queries que involucran la tabla usuarios + roles
interface UsuarioRow extends RowDataPacket {
  id_usuario: string;
  nombre: string;
  correo: string;
  contrasena: string; // Hash bcrypt — nunca se expone en la respuesta
  id_rol: string;
  nombre_rol: string; // Obtenido del JOIN con la tabla roles
  localidad: string;
  telefono: string;
  estado: number;     // 1 = activo, 0 = desactivado por el admin
  avatar_seed: string | null;
}

interface RolRow extends RowDataPacket {
  id_rol: string;
}

/**
 * Genera el par de tokens (access + refresh) a partir de los datos del usuario.
 * Se reutiliza en registro, login y refresh para evitar duplicar código.
 */
const buildTokens = (usuario: UsuarioRow) => {
  const payload = {
    id: usuario.id_usuario,
    correo: usuario.correo,
    rol: usuario.nombre_rol,
    localidad: usuario.localidad,
  };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

// ── Registro ─────────────────────────────────────────────────────────────────

export const registerService = async (dto: RegisterDto) => {
  const { nombre, correo, contrasena, localidad, telefono } = dto;

  // 1. Validar que la localidad pertenece al municipio de Cereté
  if (!LOCALIDADES_CERETE.includes(localidad)) {
    throw new Error('Localidad no válida para el municipio de Cereté');
  }

  // 2. Verificar que el correo no esté ya registrado
  const existing = await query<UsuarioRow[]>(
    'SELECT id_usuario FROM usuarios WHERE correo = ?',
    [correo]
  );
  if (existing.length > 0) {
    throw new Error('El correo ya está registrado');
  }

  // 3. Obtener el ID del rol Ciudadano (rol por defecto para nuevos usuarios)
  const roles = await query<RolRow[]>(
    'SELECT id_rol FROM roles WHERE nombre_rol = ?',
    [ROLES.CIUDADANO]
  );
  if (roles.length === 0) throw new Error('Rol Ciudadano no encontrado');

  // 4. Hashear la contraseña y generar un seed único para el avatar
  const hashed = await hashPassword(contrasena);
  const avatarSeed = randomUUID(); // Usado por DiceBear para generar el avatar del perfil

  // 5. Insertar el nuevo usuario en la base de datos
  await query(
    `INSERT INTO usuarios (nombre, correo, contrasena, id_rol, localidad, telefono, avatar_seed)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nombre, correo, hashed, roles[0].id_rol, localidad, telefono, avatarSeed]
  );

  // 6. Recuperar el usuario recién creado con su rol para generar los tokens
  const usuario = await query<UsuarioRow[]>(
    `SELECT u.id_usuario, u.nombre, u.correo, u.contrasena, u.id_rol, r.nombre_rol,
            u.localidad, u.telefono, u.estado, u.avatar_seed
     FROM usuarios u
     JOIN roles r ON u.id_rol = r.id_rol
     WHERE u.correo = ?`,
    [correo]
  );

  return buildTokens(usuario[0]);
};

// ── Login ────────────────────────────────────────────────────────────────────

export const loginService = async (dto: LoginDto) => {
  const { correo, contrasena } = dto;

  // 1. Buscar el usuario por correo junto con su rol
  const rows = await query<UsuarioRow[]>(
    `SELECT u.id_usuario, u.nombre, u.correo, u.contrasena, u.id_rol, r.nombre_rol,
            u.localidad, u.telefono, u.estado, u.avatar_seed
     FROM usuarios u
     JOIN roles r ON u.id_rol = r.id_rol
     WHERE u.correo = ?`,
    [correo]
  );

  // 2. Si no existe, retornar el mismo mensaje que contraseña incorrecta
  // (evita revelar si el correo está registrado o no)
  if (rows.length === 0) throw new Error('Credenciales inválidas');

  const usuario = rows[0];

  // 3. Verificar que la cuenta no haya sido desactivada por el admin
  if (!usuario.estado) throw new Error('Cuenta desactivada');

  // 4. Comparar la contraseña ingresada con el hash almacenado
  const valid = await comparePassword(contrasena, usuario.contrasena);
  if (!valid) throw new Error('Credenciales inválidas');

  // 5. Retornar tokens + datos del usuario para que el mobile guarde la sesión
  return {
    ...buildTokens(usuario),
    usuario: {
      id: usuario.id_usuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.nombre_rol,
      localidad: usuario.localidad,
      telefono: usuario.telefono,
      avatar_seed: usuario.avatar_seed,
    },
  };
};

// ── Refresh de tokens ────────────────────────────────────────────────────────

export const refreshService = async (dto: RefreshDto) => {
  // 1. Verificar que el refresh token sea válido y no haya expirado
  const payload = verifyRefreshToken(dto.refreshToken);

  // 2. Confirmar que el usuario aún existe y sigue activo en la BD
  // (puede haber sido desactivado después de emitir el token)
  const rows = await query<UsuarioRow[]>(
    `SELECT u.id_usuario, u.nombre, u.correo, u.contrasena, u.id_rol, r.nombre_rol,
            u.localidad, u.telefono, u.estado, u.avatar_seed
     FROM usuarios u
     JOIN roles r ON u.id_rol = r.id_rol
     WHERE u.id_usuario = ?`,
    [payload.id]
  );

  if (rows.length === 0 || !rows[0].estado) throw new Error('Usuario no válido');

  // 3. Generar y retornar un nuevo par de tokens
  return buildTokens(rows[0]);
};
