export const ROLES = {
  ADMIN: 'Admin',
  REPRESENTANTE: 'Representante',
  CIUDADANO: 'Ciudadano',
  BOMBERO: 'Bombero',
  POLICIA: 'Policía',
  PARAMEDICO: 'Paramédico',
} as const;

export type Rol = typeof ROLES[keyof typeof ROLES];

export const getRolColor = (rol: string): string => {
  switch (rol) {
    case ROLES.ADMIN:         return '#3b82f6';
    case ROLES.REPRESENTANTE: return '#8b5cf6';
    case ROLES.CIUDADANO:     return '#22c55e';
    case ROLES.BOMBERO:       return '#ef4444';
    case ROLES.POLICIA:       return '#60a5fa';
    case ROLES.PARAMEDICO:    return '#f97316';
    default:                  return '#6b7280';
  }
};

export const isAdmin        = (rol: string) => rol === ROLES.ADMIN;
export const isResponder    = (rol: string) => [ROLES.BOMBERO, ROLES.POLICIA, ROLES.PARAMEDICO].includes(rol as Rol);
export const canCreateIncident = (rol: string) => [ROLES.CIUDADANO, ROLES.REPRESENTANTE].includes(rol as Rol);

export const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'Buenos días';
  if (h >= 12 && h < 18) return 'Buenas tardes';
  return 'Buenas noches';
};
