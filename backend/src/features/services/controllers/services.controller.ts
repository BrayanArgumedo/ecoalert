import { Request, Response } from 'express';
import { getServicesService } from '../services/services.service';
import { ok, serverError } from '../../../shared/utils/response';

export const getServices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await getServicesService();
    ok(res, services);
  } catch {
    serverError(res);
  }
};
