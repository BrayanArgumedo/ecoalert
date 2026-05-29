// src/core/utils/roles.ts
// Constantes y utilidades de roles del sistema.
// Centraliza la lógica de presentación y permisos para que las pantallas
// no tengan strings de roles dispersos ni condiciones repetidas.

export const ROLES = {
  ADMIN:          'Admin',
  REPRESENTANTE:  'Representante de Localidad',
  CIUDADANO:      'Ciudadano',
  BOMBERO:        'Bombero',
  POLICIA:        'Policia',
  PARAMEDICO:     'Paramedico',
} as const;

// Correcciones de acentuación para mostrar en la UI sin afectar los valores de la BD
const ROL_DISPLAY: Record<string, string> = {
  Policia:    'Policía',
  Paramedico: 'Paramédico',
};
export const getRolDisplay = (rol: string): string => ROL_DISPLAY[rol] ?? rol;

export type Rol = typeof ROLES[keyof typeof ROLES];

// Color asociado a cada rol — usado en badges y tarjetas de usuario
export const getRolColor = (rol: string): string => {
  if (rol.includes('Admin'))          return '#3b82f6';
  if (rol.includes('Representante'))  return '#8b5cf6';
  if (rol.includes('Ciudadano'))      return '#22c55e';
  if (rol.includes('Bombero'))        return '#ef4444';
  if (rol.includes('Polici'))         return '#60a5fa'; // Cubre 'Policia' y 'Policía'
  if (rol.includes('Paramedic') || rol.includes('Paramédic')) return '#f97316';
  return '#6b7280';
};

// Helpers de permisos — usados en el _layout de tabs y en pantallas para
// mostrar u ocultar acciones según el rol del usuario autenticado
export const isAdmin          = (rol: string) => rol === ROLES.ADMIN;
export const isResponder      = (rol: string) => ([ROLES.BOMBERO, ROLES.POLICIA, ROLES.PARAMEDICO] as string[]).includes(rol);
export const canCreateIncident = (rol: string) => ([ROLES.CIUDADANO, ROLES.REPRESENTANTE] as string[]).includes(rol);

// Saludo dinámico según la hora del día — mostrado en el header del Home
export const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'Buenos días';
  if (h >= 12 && h < 18) return 'Buenas tardes';
  return 'Buenas noches';
};
