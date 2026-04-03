export interface CreateEmergencyTypeDto {
  nombre: string;
  descripcion?: string;
  icono?: string;
}

export interface UpdateEmergencyTypeDto {
  nombre?: string;
  descripcion?: string;
  icono?: string;
}
