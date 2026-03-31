export const ROLES = {
  ADMIN: 'Admin',
  REPRESENTANTE: 'Representante de Localidad',
  CIUDADANO: 'Ciudadano',
  BOMBERO: 'Bombero',
  POLICIA: 'Policia',
  PARAMEDICO: 'Paramedico',
} as const;

export const ESTADOS_INCIDENCIA = {
  PENDIENTE: 'pendiente',
  EN_PROCESO: 'en_proceso',
  RESUELTA: 'resuelta',
} as const;

export const PRIORIDAD = {
  NORMAL: 'normal',
  ALTA: 'alta',
  CRITICA: 'critica',
} as const;
