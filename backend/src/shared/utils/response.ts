import { Response } from 'express';

export const ok = (res: Response, data: unknown, message = 'OK') => {
  return res.status(200).json({ success: true, message, data });
};

export const created = (res: Response, data: unknown, message = 'Created') => {
  return res.status(201).json({ success: true, message, data });
};

export const badRequest = (res: Response, message: string) => {
  return res.status(400).json({ success: false, message });
};

export const unauthorized = (res: Response, message = 'Unauthorized') => {
  return res.status(401).json({ success: false, message });
};

export const forbidden = (res: Response, message = 'Forbidden') => {
  return res.status(403).json({ success: false, message });
};

export const notFound = (res: Response, message = 'Not found') => {
  return res.status(404).json({ success: false, message });
};

export const serverError = (res: Response, message = 'Internal server error') => {
  return res.status(500).json({ success: false, message });
};
