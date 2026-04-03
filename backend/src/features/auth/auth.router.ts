import { Router } from 'express';
import { register, login, refresh, me } from './controllers/auth.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', authMiddleware, me);

export default router;
