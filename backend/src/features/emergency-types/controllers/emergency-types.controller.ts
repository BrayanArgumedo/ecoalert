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

export const getAllTypes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const types = await getAllTypesService();
    ok(res, types);
  } catch {
    serverError(res);
  }
};

export const getTypeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const type = await getTypeByIdService(req.params.id);
    if (!type) { notFound(res, 'Tipo de emergencia no encontrado'); return; }
    ok(res, type);
  } catch {
    serverError(res);
  }
};

export const createType = async (req: Request, res: Response): Promise<void> => {
  const dto = req.body as CreateEmergencyTypeDto;
  if (!dto.nombre) { badRequest(res, 'nombre es requerido'); return; }

  try {
    const type = await createTypeService(dto);
    created(res, type, 'Tipo de emergencia creado');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear';
    badRequest(res, message);
  }
};

export const updateType = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await updateTypeService(req.params.id, req.body as UpdateEmergencyTypeDto);
    if (!updated) { notFound(res, 'Tipo de emergencia no encontrado'); return; }
    ok(res, updated, 'Tipo de emergencia actualizado');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al actualizar';
    badRequest(res, message);
  }
};

export const deleteType = async (req: Request, res: Response): Promise<void> => {
  try {
    await deleteTypeService(req.params.id);
    ok(res, null, 'Tipo de emergencia eliminado');
  } catch {
    serverError(res);
  }
};
