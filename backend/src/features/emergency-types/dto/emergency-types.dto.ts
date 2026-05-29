// src/features/emergency-types/dto/emergency-types.dto.ts
// Data Transfer Objects del módulo de tipos de emergencia.

/** Campos para registrar un nuevo tipo en el catálogo. */
export interface CreateEmergencyTypeDto {
  nombre: string;
  descripcion?: string;
  icono?: string;  // Nombre del ícono para el mobile (p. ej. 'flame', 'water', 'alert')
}

/**
 * Campos actualizables de un tipo existente.
 * Todos son opcionales — el servicio construye el SET dinámicamente.
 */
export interface UpdateEmergencyTypeDto {
  nombre?: string;
  descripcion?: string;
  icono?: string;
}
