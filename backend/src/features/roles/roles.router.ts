// src/features/roles/roles.router.ts
// Define las rutas del módulo de roles.
// Solo el Admin puede consultar el catálogo de roles,
// ya que se usa para el selector al cambiar el rol de un usuario.

import { Router } from 'express';
import { getRoles } from './controllers/roles.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { requireRoles } from '../../core/middleware/roles.middleware';
import { ROLES } from '../../shared/constants';

const router = Router();

// GET /api/v1/roles — Retorna todos los roles del sistema (solo Admin)
router.get('/', authMiddleware, requireRoles(ROLES.ADMIN), getRoles);

export default router;
