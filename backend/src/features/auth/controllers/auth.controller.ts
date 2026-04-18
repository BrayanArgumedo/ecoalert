import { Request, Response } from 'express';
import { registerService, loginService, refreshService } from '../services/auth.service';
import { created, ok, badRequest, unauthorized, serverError } from '../../../shared/utils/response';
import type { RegisterDto, LoginDto, RefreshDto } from '../dto/auth.dto';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { nombre, correo, contrasena, localidad, telefono } = req.body as RegisterDto;

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const TYPO_TLD   = /\.(con|cmo|ocm|ogr|nte|ccom|comn|om|cpm|cim)$/i;

  if (!nombre)     { badRequest(res, 'El nombre es requerido');       return; }
  if (!correo)     { badRequest(res, 'El correo es requerido');       return; }
  if (!EMAIL_REGEX.test(correo) || TYPO_TLD.test(correo)) {
    badRequest(res, 'El correo no tiene un formato válido');
    return;
  }
  if (!contrasena) { badRequest(res, 'La contraseña es requerida');   return; }
  if (!telefono)   { badRequest(res, 'El teléfono es requerido');     return; }
  if (!localidad)  { badRequest(res, 'La localidad es requerida');    return; }

  try {
    const tokens = await registerService({ nombre, correo, contrasena, localidad, telefono });
    created(res, tokens, 'Usuario registrado exitosamente');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al registrar';
    if (message === 'El correo ya está registrado' || message.startsWith('Localidad')) {
      badRequest(res, message);
    } else {
      serverError(res, message);
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { correo, contrasena } = req.body as LoginDto;

  if (!correo || !contrasena) {
    badRequest(res, 'correo y contrasena son requeridos');
    return;
  }

  try {
    const result = await loginService({ correo, contrasena });
    ok(res, result, 'Login exitoso');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
    if (message === 'Credenciales inválidas' || message === 'Cuenta desactivada') {
      unauthorized(res, message);
    } else {
      serverError(res, message);
    }
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body as RefreshDto;

  if (!refreshToken) {
    badRequest(res, 'refreshToken es requerido');
    return;
  }

  try {
    const tokens = await refreshService({ refreshToken });
    ok(res, tokens, 'Tokens renovados');
  } catch {
    unauthorized(res, 'Refresh token inválido o expirado');
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  ok(res, req.user, 'Perfil del usuario autenticado');
};
