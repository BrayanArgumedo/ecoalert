import { Router } from 'express';
import { getServices } from './controllers/services.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getServices);

export default router;
