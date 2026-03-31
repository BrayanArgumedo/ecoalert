import { Request, Response, NextFunction } from 'express';
import { forbidden } from '../../shared/utils/response';

export const requireRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.rol)) {
      forbidden(res);
      return;
    }
    next();
  };
};
