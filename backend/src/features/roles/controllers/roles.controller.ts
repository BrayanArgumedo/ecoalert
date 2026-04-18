import { Request, Response } from 'express';
import { getRolesService } from '../services/roles.service';
import { ok, serverError } from '../../../shared/utils/response';

export const getRoles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const roles = await getRolesService();
    ok(res, roles);
  } catch {
    serverError(res);
  }
};
