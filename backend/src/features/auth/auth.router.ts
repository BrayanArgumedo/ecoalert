// src/features/auth/auth.router.ts
// Define las rutas del módulo de autenticación.
// Las rutas de registro, login y refresh son públicas (sin authMiddleware)
// porque el usuario aún no tiene token al usarlas.

import { Router } from 'express';
import { register, login, refresh, me } from './controllers/auth.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';

const router = Router();

// POST /api/v1/auth/register — Crea una nueva cuenta de usuario
router.post('/register', register);

// POST /api/v1/auth/login — Autentica al usuario y retorna access + refresh token
router.post('/login', login);

// POST /api/v1/auth/refresh — Genera un nuevo access token usando el refresh token
router.post('/refresh', refresh);

// GET /api/v1/auth/me — Retorna los datos del usuario autenticado (requiere token)
router.get('/me', authMiddleware, me);

export default router;
