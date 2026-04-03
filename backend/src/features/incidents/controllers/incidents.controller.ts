import { Request, Response } from 'express';
import {
  createIncidentService,
  getAllIncidentsService,
  getIncidentByIdService,
  changeStatusService,
  getHistoryService,
} from '../services/incidents.service';
import { ok, created, badRequest, notFound, forbidden, serverError } from '../../../shared/utils/response';
import { ROLES, ESTADOS_INCIDENCIA } from '../../../shared/constants';
import type { CreateIncidentDto, ChangeStatusDto } from '../dto/incidents.dto';

export const createIncident = async (req: Request, res: Response): Promise<void> => {
  const dto = req.body as CreateIncidentDto;

  if (!dto.id_tipo_emergencia || !dto.descripcion || !dto.id_servicios?.length) {
    badRequest(res, 'id_tipo_emergencia, descripcion e id_servicios son requeridos');
    return;
  }

  try {
    const incident = await createIncidentService(dto, req.user!.id, req.user!.rol);
    created(res, incident, 'Incidencia reportada exitosamente');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear incidencia';
    serverError(res, message);
  }
};

export const getAllIncidents = async (req: Request, res: Response): Promise<void> => {
  try {
    const incidents = await getAllIncidentsService(req.user!.id, req.user!.rol);
    ok(res, incidents);
  } catch {
    serverError(res);
  }
};

export const getIncidentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const incident = await getIncidentByIdService(req.params.id);
    if (!incident) { notFound(res, 'Incidencia no encontrada'); return; }

    const { id, rol } = req.user!;
    const esDueno = incident.id_usuario === id;
    const esAdmin = rol === ROLES.ADMIN || rol === ROLES.REPRESENTANTE;
    const esResponder = incident.servicios.some((s) => s.nombre_rol === rol);

    if (!esDueno && !esAdmin && !esResponder) {
      forbidden(res);
      return;
    }

    ok(res, incident);
  } catch {
    serverError(res);
  }
};

export const changeStatus = async (req: Request, res: Response): Promise<void> => {
  const { estado } = req.body as ChangeStatusDto;
  const estadosValidos = Object.values(ESTADOS_INCIDENCIA);

  if (!estado || !estadosValidos.includes(estado)) {
    badRequest(res, `estado debe ser uno de: ${estadosValidos.join(', ')}`);
    return;
  }

  try {
    const updated = await changeStatusService(req.params.id, { estado }, req.user!.id, req.user!.rol);
    if (!updated) { notFound(res, 'Incidencia no encontrada'); return; }
    ok(res, updated, 'Estado actualizado');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al cambiar estado';
    if (message === 'No tienes un servicio asignado en esta incidencia') {
      forbidden(res, message);
    } else {
      serverError(res, message);
    }
  }
};

export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const incident = await getIncidentByIdService(req.params.id);
    if (!incident) { notFound(res, 'Incidencia no encontrada'); return; }

    const { id, rol } = req.user!;
    const esDueno = incident.id_usuario === id;
    const esAdmin = rol === ROLES.ADMIN || rol === ROLES.REPRESENTANTE;

    if (!esDueno && !esAdmin) {
      forbidden(res);
      return;
    }

    const history = await getHistoryService(req.params.id);
    ok(res, history);
  } catch {
    serverError(res);
  }
};
