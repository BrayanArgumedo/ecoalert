// src/features/services/services.router.ts
// Define las rutas del módulo de servicios públicos.
// Cualquier usuario autenticado puede consultar el catálogo de servicios,
// ya que el mobile lo necesita para mostrar el selector al reportar una incidencia.

import { Router } from 'express';
import { getServices } from './controllers/services.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';

const router = Router();

// GET /api/v1/services — Lista todos los servicios públicos disponibles
router.get('/', authMiddleware, getServices);

export default router;
