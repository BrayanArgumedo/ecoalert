// src/core/middleware/auth.middleware.ts
// Middleware de autenticación. Protege todas las rutas que lo usen
// verificando que la petición incluya un token JWT válido en el header.
// Si el token es válido, adjunta los datos del usuario a req.user
// para que los controladores puedan usarlos sin repetir la verificación.

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../shared/utils/jwt';
import { unauthorized } from '../../shared/utils/response';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // 1. Leer el header Authorization de la petición
  // La app móvil lo envía como: "Authorization: Bearer eyJhbGci..."
  const authHeader = req.headers.authorization;

  // 2. Verificar que el header existe y tiene el formato correcto
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    unauthorized(res);
    return;
  }

  // 3. Extraer solo el token (sin el prefijo "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // 4. Verificar la firma y expiración del token.
    // Si es válido, adjuntar el payload a req.user para los siguientes middlewares.
    req.user = verifyAccessToken(token);
    next();
  } catch {
    // Token inválido, expirado o manipulado
    unauthorized(res, 'Invalid or expired token');
  }
};
