// src/core/types/express.d.ts
// Extiende el tipo Request de Express para incluir el campo `user`.
// Sin esto, TypeScript no reconocería req.user en middlewares y controladores
// y marcaría error de compilación al intentar acceder a él.

import { JwtPayload } from '../../shared/utils/jwt';

declare global {
  namespace Express {
    interface Request {
      // Datos del usuario autenticado. Lo adjunta authMiddleware tras verificar el JWT.
      // Es opcional (?) porque las rutas públicas no pasan por authMiddleware.
      user?: JwtPayload;
    }
  }
}
