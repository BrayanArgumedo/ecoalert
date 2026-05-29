// src/shared/utils/response.ts
// Funciones helper para estandarizar todas las respuestas HTTP del API.
// Garantizan que siempre se retorne el mismo formato:
// { success: boolean, message: string, data?: unknown }

import { Response } from 'express';

/** 200 — Operación exitosa (GET, PUT, PATCH) */
export const ok = (res: Response, data: unknown, message = 'OK') => {
  return res.status(200).json({ success: true, message, data });
};

/** 201 — Recurso creado exitosamente (POST) */
export const created = (res: Response, data: unknown, message = 'Created') => {
  return res.status(201).json({ success: true, message, data });
};

/** 400 — Datos de entrada inválidos o faltantes */
export const badRequest = (res: Response, message: string) => {
  return res.status(400).json({ success: false, message });
};

/** 401 — Sin autenticación o token inválido */
export const unauthorized = (res: Response, message = 'Unauthorized') => {
  return res.status(401).json({ success: false, message });
};

/** 403 — Autenticado pero sin permisos para este recurso */
export const forbidden = (res: Response, message = 'Forbidden') => {
  return res.status(403).json({ success: false, message });
};

/** 404 — Recurso no encontrado */
export const notFound = (res: Response, message = 'Not found') => {
  return res.status(404).json({ success: false, message });
};

/** 500 — Error interno del servidor */
export const serverError = (res: Response, message = 'Internal server error') => {
  return res.status(500).json({ success: false, message });
};
