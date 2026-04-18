import { Router } from 'express';
import { getRoles } from './controllers/roles.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { requireRoles } from '../../core/middleware/roles.middleware';
import { ROLES } from '../../shared/constants';

const router = Router();

router.get('/', authMiddleware, requireRoles(ROLES.ADMIN), getRoles);

export default router;
