// src/main.ts
// Punto de entrada principal del servidor EcoAlert.
// Aquí se crea la aplicación Express, se registran los middlewares
// globales, se montan todas las rutas y se inicia el servidor HTTP.

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config';

// ── Routers de cada módulo (feature) ────────────────────────────────────────
// Cada router agrupa todas las rutas de su módulo bajo un prefijo común.
import authRouter from './features/auth/auth.router';
import usersRouter from './features/users/users.router';
import rolesRouter from './features/roles/roles.router';
import emergencyTypesRouter from './features/emergency-types/emergency-types.router';
import incidentsRouter from './features/incidents/incidents.router';
import servicesRouter from './features/services/services.router';

// Carga las variables de entorno del archivo .env antes de cualquier otra cosa.
// Debe llamarse lo antes posible para que config.ts pueda leerlas.
dotenv.config();

const app = express();

// ============================================================
// MIDDLEWARES GLOBALES
// Se ejecutan en orden para CADA petición que llega al servidor.
// ============================================================

// CORS: permite que la app móvil haga peticiones al API.
// Sin esto, el navegador (y React Native en web) bloquearía las respuestas.
app.use(cors());

// Parsea el body de las peticiones en formato JSON (req.body).
// Necesario para leer los datos que envía la app en POST/PATCH/PUT.
app.use(express.json());

// Parsea datos enviados como formulario HTML (application/x-www-form-urlencoded).
// extended: true permite objetos anidados en el body.
app.use(express.urlencoded({ extended: true }));

// ============================================================
// RUTAS DE LA API
// Todas bajo el prefijo /api/v1 para versionar el API.
// ============================================================

/**
 * Health Check — Ruta de diagnóstico
 *
 * Permite verificar que el servidor está corriendo sin necesidad de
 * autenticación. Render y otras plataformas la usan para saber si
 * el servicio está activo.
 *
 * GET /api/v1/health
 */
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'EcoAlert API running', env: config.env });
});

// Autenticación: registro, login, refresh de tokens
app.use('/api/v1/auth', authRouter);

// Gestión de usuarios: perfil, cambio de contraseña, administración
app.use('/api/v1/users', usersRouter);

// Roles disponibles en el sistema (solo lectura)
app.use('/api/v1/roles', rolesRouter);

// Tipos de emergencia: CRUD para Admin, consulta para todos
app.use('/api/v1/emergency-types', emergencyTypesRouter);

// Incidencias: reporte, seguimiento y gestión por rol
app.use('/api/v1/incidents', incidentsRouter);

// Servicios públicos: bomberos, policía, paramédicos (solo lectura)
app.use('/api/v1/services', servicesRouter);

// ============================================================
// MANEJADOR DE RUTAS NO ENCONTRADAS (404)
// Se ejecuta si ninguna ruta anterior coincidió con la petición.
// ============================================================
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ============================================================
// MANEJADOR GLOBAL DE ERRORES (500)
// Captura cualquier error no controlado que llegue hasta aquí.
// Express lo identifica por tener 4 parámetros (err, req, res, next).
// ============================================================
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ============================================================
// INICIO DEL SERVIDOR
// ============================================================

// Inicia el servidor HTTP en el puerto definido en las variables de entorno.
// El puerto lo provee Render en producción; en local usa el del .env.
app.listen(config.port, () => {
  console.log(`EcoAlert backend running on port ${config.port} [${config.env}]`);
});

export default app;
