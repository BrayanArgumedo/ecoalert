// src/features/roles/controllers/roles.controller.ts
// Controlador del módulo de roles.
// Módulo de solo lectura: expone el catálogo de roles para que el Admin
// pueda seleccionar un rol al actualizar un usuario desde la interfaz.

import { Request, Response } from 'express';
import { getRolesService } from '../services/roles.service';
import { ok, serverError } from '../../../shared/utils/response';

// ── Listar roles ──────────────────────────────────────────────────────────────

export const getRoles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const roles = await getRolesService();
    ok(res, roles);
  } catch {
    serverError(res);
  }
};
