import { Request, Response } from 'express';
import {
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  updateUserRoleService,
  deactivateUserService,
} from '../services/users.service';
import { ok, badRequest, notFound, forbidden, serverError } from '../../../shared/utils/response';
import { ROLES } from '../../../shared/constants';
import type { UpdateUserDto, UpdateRoleDto } from '../dto/users.dto';

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await getAllUsersService();
    ok(res, users);
  } catch {
    serverError(res);
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Solo el propio usuario o un Admin pueden ver el perfil
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

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Solo el propio usuario o un Admin pueden editar
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
    const message = err instanceof Error ? err.message : 'Error al actualizar';
    badRequest(res, message);
  }
};

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
    const message = err instanceof Error ? err.message : 'Error al actualizar rol';
    badRequest(res, message);
  }
};

export const deactivateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await deactivateUserService(id);
    ok(res, null, 'Usuario desactivado');
  } catch {
    serverError(res);
  }
};
