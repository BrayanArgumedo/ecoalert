import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config';
import authRouter from './features/auth/auth.router';
import usersRouter from './features/users/users.router';

dotenv.config();

const app = express();

// ── Middlewares globales ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas ───────────────────────────────────────────────────────────────────
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'EcoAlert API running', env: config.env });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);

// TODO: registrar rutas de cada módulo aquí a medida que se implementen
// app.use('/api/v1/users', usersRouter);
// app.use('/api/v1/incidents', incidentsRouter);
// app.use('/api/v1/emergency-types', emergencyTypesRouter);
// app.use('/api/v1/notifications', notificationsRouter);
// app.use('/api/v1/reports', reportsRouter);

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Error handler global ────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Iniciar servidor ────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`EcoAlert backend running on port ${config.port} [${config.env}]`);
});

export default app;
