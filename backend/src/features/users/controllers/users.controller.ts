// src/features/users/controllers/users.controller.ts
// Controladores del módulo de usuarios.
// Validan permisos de acceso (propio usuario vs Admin), delegan la lógica
// al servicio y retornan la respuesta HTTP correspondiente.

import { Request, Response } from 'express';
import {
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  updateUserRoleService,
  deactivateUserService,
  toggleUserStatusService,
  updateAvatarService,
} from '../services/users.service';
import { ok, badRequest, notFound, forbidden, serverError } from '../../../shared/utils/response';
import { ROLES } from '../../../shared/constants';
import type { UpdateUserDto, UpdateRoleDto } from '../dto/users.dto';

// ── Listar todos los usuarios ─────────────────────────────────────────────────

// Solo el Admin llega aquí (requireRoles lo garantiza en el router)
export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await getAllUsersService();
    ok(res, users);
  } catch {
    serverError(res);
  }
};

// ── Obtener perfil de un usuario ──────────────────────────────────────────────

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Verificación manual de permisos: el router no usa requireRoles aquí
  // porque tanto el propio usuario como el Admin pueden acceder
  if (req.user?.rol !== ROLES.ADMIN && req.user?.id !== id) {
    forbidden(res);
    return;
  }

  try {
    const user = await getUserByIdService(id);
    if (!user) {
      notFound(res, 'Usuario no encontrado');
      return;
    }
    ok(res, user);
  } catch {
    serverError(res);
  }
};

// ── Actualizar datos del perfil ───────────────────────────────────────────────

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Misma lógica de permisos que getUserById: propio usuario o Admin
  if (req.user?.rol !== ROLES.ADMIN && req.user?.id !== id) {
    forbidden(res);
    return;
  }

  const dto = req.body as UpdateUserDto;

  try {
    const updated = await updateUserService(id, dto);
    if (!updated) {
      notFound(res, 'Usuario no encontrado');
      return;
    }
    ok(res, updated, 'Usuario actualizado');
  } catch (err) {
    // Los errores del servicio son errores de validación de negocio (→ 400):
    // contraseña actual incorrecta, sin campos para actualizar, etc.
    const message = err instanceof Error ? err.message : 'Error al actualizar';
    badRequest(res, message);
  }
};

// ── Cambiar el rol de un usuario ──────────────────────────────────────────────

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const dto = req.body as UpdateRoleDto;

  if (!dto.id_rol) {
    badRequest(res, 'id_rol es requerido');
    return;
  }

  try {
    const updated = await updateUserRoleService(id, dto);
    if (!updated) {
      notFound(res, 'Usuario no encontrado');
      return;
    }
    ok(res, updated, 'Rol actualizado');
  } catch (err) {
    // El servicio lanza errores descriptivos cuando viola las reglas de unicidad
    // (p. ej. ya existe un Bombero activo). Se exponen al cliente como 400.
    const message = err instanceof Error ? err.message : 'Error al actualizar rol';
    badRequest(res, message);
  }
};

// ── Desactivar cuenta (DELETE semántico) ──────────────────────────────────────

// No elimina el registro — establece estado = FALSE para conservar el historial
export const deactivateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await deactivateUserService(id);
    ok(res, null, 'Usuario desactivado');
  } catch {
    serverError(res);
  }
};

// ── Actualizar seed del avatar ────────────────────────────────────────────────

export const updateAvatar = async (req: Request, res: Response): Promise<void> => {
  // El userId viene del token, no del parámetro, para que un usuario
  // no pueda cambiar el avatar de otro enviando un id diferente
  const userId = req.user?.id;
  const { seed } = req.body as { seed: string };

  if (!userId) { forbidden(res); return; }
  if (!seed || typeof seed !== 'string' || seed.trim().length === 0) {
    badRequest(res, 'seed es requerido'); return;
  }

  try {
    const updated = await updateAvatarService(userId, seed.trim());
    if (!updated) { notFound(res, 'Usuario no encontrado'); return; }
    ok(res, updated, 'Avatar actualizado');
  } catch {
    serverError(res);
  }
};

// ── Activar o desactivar cuenta ───────────────────────────────────────────────

export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { estado } = req.body as { estado: boolean };

  // Se valida el tipo porque JSON puede enviar "true" como string
  if (typeof estado !== 'boolean') {
    badRequest(res, 'estado debe ser un booleano');
    return;
  }

  try {
    const updated = await toggleUserStatusService(id, estado);
    if (!updated) {
      notFound(res, 'Usuario no encontrado');
      return;
    }
    // El mensaje refleja la acción real aplicada para que el cliente no tenga que inferirla
    ok(res, updated, estado ? 'Usuario activado' : 'Usuario desactivado');
  } catch {
    serverError(res);
  }
};
