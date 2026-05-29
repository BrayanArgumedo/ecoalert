// src/features/incidents/incidents.router.ts
// Define las rutas del módulo de incidencias.
// Todos los endpoints requieren autenticación. La creación está limitada
// a Ciudadano y Representante; el cambio de estado a roles con capacidad
// de respuesta; aceptar incidencia solo a los responders.

import { Router } from 'express';
import { createIncident, getAllIncidents, getIncidentById, changeStatus, acceptIncident, getHistory } from './controllers/incidents.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { requireRoles } from '../../core/middleware/roles.middleware';
import { ROLES } from '../../shared/constants';

const router = Router();

router.use(authMiddleware);

// POST /api/v1/incidents — Reporta una nueva incidencia (Ciudadano o Representante)
router.post('/', requireRoles(ROLES.CIUDADANO, ROLES.REPRESENTANTE), createIncident);

// GET  /api/v1/incidents — Lista incidencias filtradas según el rol del usuario autenticado
router.get('/', getAllIncidents);

// GET  /api/v1/incidents/:id — Detalle de una incidencia (dueño, Admin, Representante o responder asignado)
router.get('/:id', getIncidentById);

// PATCH /api/v1/incidents/:id/status — Cambia el estado de la incidencia
router.patch('/:id/status', requireRoles(ROLES.ADMIN, ROLES.REPRESENTANTE, ROLES.BOMBERO, ROLES.POLICIA, ROLES.PARAMEDICO), changeStatus);

// PATCH /api/v1/incidents/:id/accept — El responder asignado confirma que va a atender la incidencia
router.patch('/:id/accept', requireRoles(ROLES.BOMBERO, ROLES.POLICIA, ROLES.PARAMEDICO), acceptIncident);

// GET  /api/v1/incidents/:id/history — Historial de cambios de estado (mismos permisos que el detalle)
router.get('/:id/history', getHistory);

export default router;
