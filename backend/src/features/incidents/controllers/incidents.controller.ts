// src/features/incidents/incidents.controller.ts
// Controladores del módulo de incidencias.
// Validan el body de entrada, aplican verificaciones de acceso donde el router
// no puede hacerlo con requireRoles, y delegan la lógica al servicio.

import { Request, Response } from 'express';
import {
  createIncidentService,
  getAllIncidentsService,
  getIncidentByIdService,
  changeStatusService,
  aceptarIncidenteService,
  getHistoryService,
} from '../services/incidents.service';
import { ok, created, badRequest, notFound, forbidden, serverError } from '../../../shared/utils/response';
import { ROLES, ESTADOS_INCIDENCIA } from '../../../shared/constants';
import type { CreateIncidentDto, ChangeStatusDto } from '../dto/incidents.dto';

// ── Crear incidencia ──────────────────────────────────────────────────────────

export const createIncident = async (req: Request, res: Response): Promise<void> => {
  const dto = req.body as CreateIncidentDto;

  // id_servicios debe ser un array con al menos un servicio seleccionado
  if (!dto.id_tipo_emergencia || !dto.descripcion || !dto.id_servicios?.length) {
    badRequest(res, 'id_tipo_emergencia, descripcion e id_servicios son requeridos');
    return;
  }

  try {
    // Se pasan el ID y el rol del usuario para asignar prioridad automáticamente
    const incident = await createIncidentService(dto, req.user!.id, req.user!.rol);
    created(res, incident, 'Incidencia reportada exitosamente');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear incidencia';
    serverError(res, message);
  }
};

// ── Listar incidencias ────────────────────────────────────────────────────────

export const getAllIncidents = async (req: Request, res: Response): Promise<void> => {
  try {
    // El servicio filtra qué incidencias puede ver cada rol.
    // Se pasa también la localidad del usuario para el filtro del Representante.
    const { prioridad, estado } = req.query as { prioridad?: string; estado?: string };
    const incidents = await getAllIncidentsService(
      req.user!.id,
      req.user!.rol,
      req.user!.localidad ?? null,
      { prioridad, estado }
    );
    ok(res, incidents);
  } catch {
    serverError(res);
  }
};

// ── Detalle de una incidencia ─────────────────────────────────────────────────

export const getIncidentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const incident = await getIncidentByIdService(req.params.id);
    if (!incident) { notFound(res, 'Incidencia no encontrada'); return; }

    const { id, rol } = req.user!;
    const esDueno    = incident.id_usuario === id;
    const esAdmin    = rol === ROLES.ADMIN || rol === ROLES.REPRESENTANTE;
    // Un responder puede ver el detalle si su rol está entre los servicios asignados
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

// ── Cambiar estado ────────────────────────────────────────────────────────────

export const changeStatus = async (req: Request, res: Response): Promise<void> => {
  const { estado } = req.body as ChangeStatusDto;
  const estadosValidos = Object.values(ESTADOS_INCIDENCIA);

  // Validar que el estado enviado es uno de los valores permitidos por el dominio
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
    // El servicio lanza este mensaje cuando el responder no tiene el servicio asignado
    if (message === 'No tienes un servicio asignado en esta incidencia') {
      forbidden(res, message);
    } else {
      serverError(res, message);
    }
  }
};

// ── Aceptar incidencia ────────────────────────────────────────────────────────

export const acceptIncident = async (req: Request, res: Response): Promise<void> => {
  try {
    // El servicio verifica internamente que el rol del usuario esté en los servicios
    // asignados a esta incidencia antes de marcarla como aceptada
    const updated = await aceptarIncidenteService(req.params.id, req.user!.rol);
    if (!updated) { notFound(res, 'Incidencia no encontrada'); return; }
    ok(res, updated, 'Incidencia aceptada');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al aceptar';
    if (message === 'No tienes un servicio asignado en esta incidencia') {
      forbidden(res, message);
    } else {
      serverError(res, message);
    }
  }
};

// ── Historial de estados ──────────────────────────────────────────────────────

export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    // Se reutiliza getIncidentByIdService para verificar permisos antes de
    // retornar el historial (mismo control de acceso que el detalle)
    const incident = await getIncidentByIdService(req.params.id);
    if (!incident) { notFound(res, 'Incidencia no encontrada'); return; }

    const { id, rol } = req.user!;
    const esDueno     = incident.id_usuario === id;
    const esAdmin     = rol === ROLES.ADMIN || rol === ROLES.REPRESENTANTE;
    const esResponder = incident.servicios.some((s) => s.nombre_rol === rol);

    if (!esDueno && !esAdmin && !esResponder) {
      forbidden(res);
      return;
    }

    const history = await getHistoryService(req.params.id);
    ok(res, history);
  } catch {
    serverError(res);
  }
};
