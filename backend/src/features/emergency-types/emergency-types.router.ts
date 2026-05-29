// src/features/emergency-types/emergency-types.router.ts
// Define las rutas del módulo de tipos de emergencia.
// La consulta está disponible para cualquier usuario autenticado,
// ya que el mobile la necesita para poblar el selector al reportar.
// Las operaciones de escritura (crear, editar, eliminar) son exclusivas del Admin.

import { Router } from 'express';
import { getAllTypes, getTypeById, createType, updateType, deleteType } from './controllers/emergency-types.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { requireRoles } from '../../core/middleware/roles.middleware';
import { ROLES } from '../../shared/constants';

const router = Router();

// GET /api/v1/emergency-types      — Lista todos los tipos (cualquier usuario autenticado)
router.get('/', authMiddleware, getAllTypes);

// GET /api/v1/emergency-types/:id  — Detalle de un tipo (cualquier usuario autenticado)
router.get('/:id', authMiddleware, getTypeById);

// POST   /api/v1/emergency-types      — Crea un nuevo tipo de emergencia (solo Admin)
router.post('/', authMiddleware, requireRoles(ROLES.ADMIN), createType);

// PATCH  /api/v1/emergency-types/:id  — Actualiza nombre, descripción o ícono (solo Admin)
router.patch('/:id', authMiddleware, requireRoles(ROLES.ADMIN), updateType);

// DELETE /api/v1/emergency-types/:id  — Elimina un tipo de emergencia (solo Admin)
router.delete('/:id', authMiddleware, requireRoles(ROLES.ADMIN), deleteType);

export default router;
