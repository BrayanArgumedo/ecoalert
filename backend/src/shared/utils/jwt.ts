// src/shared/utils/jwt.ts
// Funciones para generar y verificar los tokens JWT del sistema.
// EcoAlert usa dos tokens: access token (corta duración, 24h) y
// refresh token (larga duración, 7d) para renovar la sesión sin re-login.

import jwt from 'jsonwebtoken';
import { config } from '../../config';

/**
 * Datos del usuario que se almacenan dentro del token JWT.
 * Disponibles en req.user tras pasar por authMiddleware.
 */
export interface JwtPayload {
  id: string;        // UUID del usuario
  correo: string;    // Correo electrónico
  rol: string;       // Nombre del rol: 'Admin', 'Ciudadano', 'Bombero', etc.
  localidad: string; // Barrio/vereda del usuario (filtra incidencias por territorio)
}

/**
 * Genera un access token firmado con el secreto principal.
 * Expira en 24h — usado en cada petición autenticada.
 */
export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
};

/**
 * Genera un refresh token firmado con un secreto distinto al access token.
 * Expira en 7d — usado solo para obtener un nuevo access token.
 */
export const signRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  });
};

/**
 * Verifica y decodifica un access token.
 * @throws Error si el token es inválido o expiró
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
};

/**
 * Verifica y decodifica un refresh token.
 * @throws Error si el token es inválido o expiró
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
};
