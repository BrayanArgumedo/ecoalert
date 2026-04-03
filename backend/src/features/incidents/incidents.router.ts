import { Router } from 'express';
import { createIncident, getAllIncidents, getIncidentById, changeStatus, getHistory } from './controllers/incidents.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { requireRoles } from '../../core/middleware/roles.middleware';
import { ROLES } from '../../shared/constants';

const router = Router();

router.use(authMiddleware);

router.post('/', requireRoles(ROLES.CIUDADANO, ROLES.REPRESENTANTE), createIncident);
router.get('/', getAllIncidents);
router.get('/:id', getIncidentById);
router.patch('/:id/status', requireRoles(ROLES.ADMIN, ROLES.BOMBERO, ROLES.POLICIA, ROLES.PARAMEDICO), changeStatus);
router.get('/:id/history', getHistory);

export default router;
