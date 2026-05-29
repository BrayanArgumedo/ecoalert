// src/shared/constants.ts
// Constantes globales del dominio de negocio.
// Centralizar estos valores evita strings dispersos por el código
// y facilita cambiarlos en un solo lugar si fuera necesario.

// ── Roles del sistema ────────────────────────────────────────────────────────
// Deben coincidir exactamente con los valores en la tabla `roles` de la BD.
export const ROLES = {
  ADMIN: 'Admin',
  REPRESENTANTE: 'Representante de Localidad',
  CIUDADANO: 'Ciudadano',
  BOMBERO: 'Bombero',
  POLICIA: 'Policia',
  PARAMEDICO: 'Paramedico',
} as const;

// ── Estados del ciclo de vida de una incidencia ──────────────────────────────
// pendiente → en_proceso → resuelta (flujo lineal, no reversible)
export const ESTADOS_INCIDENCIA = {
  PENDIENTE: 'pendiente',    // Recién reportada, sin respuesta aún
  EN_PROCESO: 'en_proceso',  // Un servicio público está atendiendo
  RESUELTA: 'resuelta',      // Emergencia atendida y cerrada
} as const;

// ── Niveles de prioridad de una incidencia ───────────────────────────────────
// La prioridad se asigna automáticamente según el rol del reportante:
// Ciudadano → normal | Representante de Localidad → alta
export const PRIORIDAD = {
  NORMAL: 'normal',   // Reportada por un ciudadano
  ALTA: 'alta',       // Reportada por un Representante de Localidad
  CRITICA: 'critica', // Reservado para escalamiento futuro
} as const;
