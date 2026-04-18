import { RowDataPacket } from 'mysql2';
import { query } from '../../../infrastructure/database/query';
import { hashPassword, comparePassword } from '../../../shared/utils/bcrypt';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../../shared/utils/jwt';
import { ROLES } from '../../../shared/constants';
import { LOCALIDADES_CERETE } from '../../../shared/constants/localidades';
import type { RegisterDto, LoginDto, RefreshDto } from '../dto/auth.dto';

interface UsuarioRow extends RowDataPacket {
  id_usuario: string;
  nombre: string;
  correo: string;
  contrasena: string;
  id_rol: string;
  nombre_rol: string;
  localidad: string;
  telefono: string;
  estado: number;
}

interface RolRow extends RowDataPacket {
  id_rol: string;
}

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

export const registerService = async (dto: RegisterDto) => {
  const { nombre, correo, contrasena, localidad, telefono } = dto;

  // Validar que la localidad pertenece a la lista oficial de Cereté
  if (!LOCALIDADES_CERETE.includes(localidad)) {
    throw new Error('Localidad no válida para el municipio de Cereté');
  }

  // Verificar correo duplicado
  const existing = await query<UsuarioRow[]>(
    'SELECT id_usuario FROM usuarios WHERE correo = ?',
    [correo]
  );
  if (existing.length > 0) {
    throw new Error('El correo ya está registrado');
  }

  // Rol por defecto: Ciudadano
  const roles = await query<RolRow[]>(
    'SELECT id_rol FROM roles WHERE nombre_rol = ?',
    [ROLES.CIUDADANO]
  );
  if (roles.length === 0) {
    throw new Error('Rol Ciudadano no encontrado');
  }

  const hashed = await hashPassword(contrasena);

  await query(
    `INSERT INTO usuarios (nombre, correo, contrasena, id_rol, localidad, telefono)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nombre, correo, hashed, roles[0].id_rol, localidad, telefono]
  );

  const usuario = await query<UsuarioRow[]>(
    `SELECT u.id_usuario, u.nombre, u.correo, u.contrasena, u.id_rol, r.nombre_rol,
            u.localidad, u.telefono, u.estado
     FROM usuarios u
     JOIN roles r ON u.id_rol = r.id_rol
     WHERE u.correo = ?`,
    [correo]
  );

  return buildTokens(usuario[0]);
};

export const loginService = async (dto: LoginDto) => {
  const { correo, contrasena } = dto;

  const rows = await query<UsuarioRow[]>(
    `SELECT u.id_usuario, u.nombre, u.correo, u.contrasena, u.id_rol, r.nombre_rol,
            u.localidad, u.telefono, u.estado
     FROM usuarios u
     JOIN roles r ON u.id_rol = r.id_rol
     WHERE u.correo = ?`,
    [correo]
  );

  if (rows.length === 0) {
    throw new Error('Credenciales inválidas');
  }

  const usuario = rows[0];

  if (!usuario.estado) {
    throw new Error('Cuenta desactivada');
  }

  const valid = await comparePassword(contrasena, usuario.contrasena);
  if (!valid) {
    throw new Error('Credenciales inválidas');
  }

  return {
    ...buildTokens(usuario),
    usuario: {
      id: usuario.id_usuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.nombre_rol,
      localidad: usuario.localidad,
      telefono: usuario.telefono,
    },
  };
};

export const refreshService = async (dto: RefreshDto) => {
  const payload = verifyRefreshToken(dto.refreshToken);

  // Verificar que el usuario aún existe y está activo
  const rows = await query<UsuarioRow[]>(
    `SELECT u.id_usuario, u.nombre, u.correo, u.contrasena, u.id_rol, r.nombre_rol,
            u.localidad, u.telefono, u.estado
     FROM usuarios u
     JOIN roles r ON u.id_rol = r.id_rol
     WHERE u.id_usuario = ?`,
    [payload.id]
  );

  if (rows.length === 0 || !rows[0].estado) {
    throw new Error('Usuario no válido');
  }

  return buildTokens(rows[0]);
};
