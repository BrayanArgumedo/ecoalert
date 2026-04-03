import { Router } from 'express';
import { getAllTypes, getTypeById, createType, updateType, deleteType } from './controllers/emergency-types.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { requireRoles } from '../../core/middleware/roles.middleware';
import { ROLES } from '../../shared/constants';

const router = Router();

// Listar y ver detalle: cualquier usuario autenticado
router.get('/', authMiddleware, getAllTypes);
router.get('/:id', authMiddleware, getTypeById);

// Crear, editar, eliminar: solo Admin
router.post('/', authMiddleware, requireRoles(ROLES.ADMIN), createType);
router.patch('/:id', authMiddleware, requireRoles(ROLES.ADMIN), updateType);
router.delete('/:id', authMiddleware, requireRoles(ROLES.ADMIN), deleteType);

export default router;
