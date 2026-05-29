// src/features/auth/controllers/auth.controller.ts
// Controladores del módulo de autenticación.
// Responsabilidad: validar los datos de entrada, llamar al servicio
// correspondiente y retornar la respuesta HTTP adecuada.
// La lógica de negocio vive en auth.service.ts, no aquí.

import { Request, Response } from 'express';
import { registerService, loginService, refreshService } from '../services/auth.service';
import { created, ok, badRequest, unauthorized, serverError } from '../../../shared/utils/response';
import type { RegisterDto, LoginDto, RefreshDto } from '../dto/auth.dto';

// ── Registro ─────────────────────────────────────────────────────────────────

export const register = async (req: Request, res: Response): Promise<void> => {
  const { nombre, correo, contrasena, localidad, telefono } = req.body as RegisterDto;

  // Valida formato estándar de correo electrónico
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Detecta errores tipográficos comunes en el TLD (.con, .cmo, .ocm, etc.)
  const TYPO_TLD = /\.(con|cmo|ocm|ogr|nte|ccom|comn|om|cpm|cim)$/i;

  if (!nombre)     { badRequest(res, 'El nombre es requerido');     return; }
  if (!correo)     { badRequest(res, 'El correo es requerido');     return; }
  if (!EMAIL_REGEX.test(correo) || TYPO_TLD.test(correo)) {
    badRequest(res, 'El correo no tiene un formato válido');
    return;
  }
  if (!contrasena) { badRequest(res, 'La contraseña es requerida'); return; }
  if (!telefono)   { badRequest(res, 'El teléfono es requerido');   return; }
  if (!localidad)  { badRequest(res, 'La localidad es requerida');  return; }

  try {
    const tokens = await registerService({ nombre, correo, contrasena, localidad, telefono });
    created(res, tokens, 'Usuario registrado exitosamente');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al registrar';
    // Errores de negocio conocidos → 400. Errores inesperados → 500
    if (message === 'El correo ya está registrado' || message.startsWith('Localidad')) {
      badRequest(res, message);
    } else {
      serverError(res, message);
    }
  }
};

// ── Login ────────────────────────────────────────────────────────────────────

export const login = async (req: Request, res: Response): Promise<void> => {
  const { correo, contrasena } = req.body as LoginDto;

  if (!correo || !contrasena) {
    badRequest(res, 'correo y contrasena son requeridos');
    return;
  }

  try {
    // El servicio retorna { accessToken, refreshToken, usuario }
    const result = await loginService({ correo, contrasena });
    ok(res, result, 'Login exitoso');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
    // Credenciales incorrectas o cuenta inactiva → 401. Otros errores → 500
    if (message === 'Credenciales inválidas' || message === 'Cuenta desactivada') {
      unauthorized(res, message);
    } else {
      serverError(res, message);
    }
  }
};

// ── Refresh de tokens ────────────────────────────────────────────────────────

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body as RefreshDto;

  if (!refreshToken) {
    badRequest(res, 'refreshToken es requerido');
    return;
  }

  try {
    // Genera un nuevo par de tokens usando el refresh token vigente
    const tokens = await refreshService({ refreshToken });
    ok(res, tokens, 'Tokens renovados');
  } catch {
    // Cualquier error al verificar el token se trata como no autorizado
    unauthorized(res, 'Refresh token inválido o expirado');
  }
};

// ── Perfil autenticado ────────────────────────────────────────────────────────

/**
 * Retorna los datos del usuario autenticado.
 * req.user ya fue adjuntado por authMiddleware, no requiere lógica adicional.
 */
export const me = async (req: Request, res: Response): Promise<void> => {
  ok(res, req.user, 'Perfil del usuario autenticado');
};
