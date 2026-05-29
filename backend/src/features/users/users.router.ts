// src/features/users/users.router.ts
// Define las rutas del módulo de usuarios.
// Todos los endpoints requieren autenticación. Los de administración
// además requieren el rol Admin mediante requireRoles.

import { Router } from 'express';
import { getAllUsers, getUserById, updateUser, updateUserRole, deactivateUser, toggleUserStatus, updateAvatar } from './controllers/users.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { requireRoles } from '../../core/middleware/roles.middleware';
import { ROLES } from '../../shared/constants';

const router = Router();

// Aplica authMiddleware a todas las rutas de este router de una sola vez
router.use(authMiddleware);

// GET  /api/v1/users        — Lista todos los usuarios (solo Admin)
router.get('/', requireRoles(ROLES.ADMIN), getAllUsers);

// GET  /api/v1/users/:id    — Perfil de un usuario (propio usuario o Admin)
router.get('/:id', getUserById);

// PATCH /api/v1/users/me/avatar — Cambia el seed del avatar del usuario autenticado
// Debe ir antes de /:id para que Express no interprete "me" como un ID
router.patch('/me/avatar', updateAvatar);

// PATCH /api/v1/users/:id        — Actualiza nombre, localidad, teléfono o contraseña
router.patch('/:id', updateUser);

// PATCH /api/v1/users/:id/role   — Cambia el rol de un usuario (solo Admin)
router.patch('/:id/role', requireRoles(ROLES.ADMIN), updateUserRole);

// PATCH /api/v1/users/:id/status — Activa o desactiva una cuenta (solo Admin)
router.patch('/:id/status', requireRoles(ROLES.ADMIN), toggleUserStatus);

// DELETE /api/v1/users/:id — Desactiva la cuenta de un usuario (solo Admin)
router.delete('/:id', requireRoles(ROLES.ADMIN), deactivateUser);

export default router;
