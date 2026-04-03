import { Router } from 'express';
import { getAllUsers, getUserById, updateUser, updateUserRole, deactivateUser } from './controllers/users.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { requireRoles } from '../../core/middleware/roles.middleware';
import { ROLES } from '../../shared/constants';

const router = Router();

// Todos los endpoints requieren estar autenticado
router.use(authMiddleware);

router.get('/', requireRoles(ROLES.ADMIN), getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.patch('/:id/role', requireRoles(ROLES.ADMIN), updateUserRole);
router.delete('/:id', requireRoles(ROLES.ADMIN), deactivateUser);

export default router;
