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
  if (rol.includes('Admin'))          return '#3b82f6';
  if (rol.includes('Representante'))  return '#8b5cf6';
  if (rol.includes('Ciudadano'))      return '#22c55e';
  if (rol.includes('Bombero'))        return '#ef4444';
  if (rol.includes('Polici'))         return '#60a5fa'; // Policía / Policia
  if (rol.includes('Paramedic') || rol.includes('Paramédic')) return '#f97316';
  return '#6b7280';
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
