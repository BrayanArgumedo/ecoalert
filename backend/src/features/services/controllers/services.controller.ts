// src/features/services/controllers/services.controller.ts
// Controlador del módulo de servicios públicos.
// Módulo de solo lectura: expone el catálogo de servicios para que el usuario
// pueda seleccionar cuáles deben atender su incidencia al reportarla.

import { Request, Response } from 'express';
import { getServicesService } from '../services/services.service';
import { ok, serverError } from '../../../shared/utils/response';

// ── Listar servicios ──────────────────────────────────────────────────────────

export const getServices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await getServicesService();
    ok(res, services);
  } catch {
    serverError(res);
  }
};
