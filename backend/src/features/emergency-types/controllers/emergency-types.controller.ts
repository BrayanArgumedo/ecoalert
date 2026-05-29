// src/features/emergency-types/controllers/emergency-types.controller.ts
// Controladores del módulo de tipos de emergencia.
// Los permisos de escritura se delegan a requireRoles en el router;
// aquí solo se valida el body y se maneja la respuesta HTTP.

import { Request, Response } from 'express';
import {
  getAllTypesService,
  getTypeByIdService,
  createTypeService,
  updateTypeService,
  deleteTypeService,
} from '../services/emergency-types.service';
import { ok, created, badRequest, notFound, serverError } from '../../../shared/utils/response';
import type { CreateEmergencyTypeDto, UpdateEmergencyTypeDto } from '../dto/emergency-types.dto';

// ── Listar tipos ──────────────────────────────────────────────────────────────

// Retorna todos los tipos ordenados alfabéticamente.
// El mobile usa esta lista para poblar el selector al reportar una incidencia.
export const getAllTypes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const types = await getAllTypesService();
    ok(res, types);
  } catch {
    serverError(res);
  }
};

// ── Obtener tipo por ID ───────────────────────────────────────────────────────

export const getTypeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const type = await getTypeByIdService(req.params.id);
    if (!type) { notFound(res, 'Tipo de emergencia no encontrado'); return; }
    ok(res, type);
  } catch {
    serverError(res);
  }
};

// ── Crear tipo ────────────────────────────────────────────────────────────────

export const createType = async (req: Request, res: Response): Promise<void> => {
  const dto = req.body as CreateEmergencyTypeDto;

  // Solo nombre es obligatorio; descripción e ícono son opcionales
  if (!dto.nombre) { badRequest(res, 'nombre es requerido'); return; }

  try {
    const type = await createTypeService(dto);
    created(res, type, 'Tipo de emergencia creado');
  } catch (err) {
    // El servicio lanza error si ya existe un tipo con el mismo nombre
    const message = err instanceof Error ? err.message : 'Error al crear';
    badRequest(res, message);
  }
};

// ── Actualizar tipo ───────────────────────────────────────────────────────────

export const updateType = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await updateTypeService(req.params.id, req.body as UpdateEmergencyTypeDto);
    if (!updated) { notFound(res, 'Tipo de emergencia no encontrado'); return; }
    ok(res, updated, 'Tipo de emergencia actualizado');
  } catch (err) {
    // El servicio lanza error si no hay campos para actualizar
    const message = err instanceof Error ? err.message : 'Error al actualizar';
    badRequest(res, message);
  }
};

// ── Eliminar tipo ─────────────────────────────────────────────────────────────

// Eliminación física del registro. Si el tipo tiene incidencias vinculadas,
// MySQL lanzará un error de FK que se captura como serverError.
export const deleteType = async (req: Request, res: Response): Promise<void> => {
  try {
    await deleteTypeService(req.params.id);
    ok(res, null, 'Tipo de emergencia eliminado');
  } catch {
    serverError(res);
  }
};
