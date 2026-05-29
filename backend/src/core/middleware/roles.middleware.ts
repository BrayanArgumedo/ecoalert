// src/core/middleware/roles.middleware.ts
// Middleware de autorización basado en roles (RBAC).
// Se usa siempre después de authMiddleware, que ya garantiza que req.user existe.

import { Request, Response, NextFunction } from 'express';
import { forbidden } from '../../shared/utils/response';

/**
 * Factory que genera un middleware que restringe el acceso a los roles indicados.
 *
 * Uso en el router:
 *   router.get('/', authMiddleware, requireRoles('Admin'), controller)
 *   router.get('/', authMiddleware, requireRoles('Admin', 'Representante'), controller)
 *
 * @param roles - Uno o más nombres de rol que pueden acceder a la ruta
 */
export const requireRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Si el rol del usuario autenticado no está en la lista permitida → 403 Forbidden
    if (!req.user || !roles.includes(req.user.rol)) {
      forbidden(res);
      return;
    }
    next();
  };
};
