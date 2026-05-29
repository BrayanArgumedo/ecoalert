// src/features/incidents/dto/incidents.dto.ts
// Data Transfer Objects del módulo de incidencias.

import { ESTADOS_INCIDENCIA } from '../../../shared/constants';

/**
 * Campos requeridos y opcionales para reportar una nueva incidencia.
 * id_servicios debe contener al menos un servicio público a notificar.
 */
export interface CreateIncidentDto {
  id_tipo_emergencia: string;
  descripcion: string;
  direccion?: string;
  latitud?: number;
  longitud?: number;
  hay_heridos?: boolean;
  cantidad_heridos?: number;  // Solo relevante cuando hay_heridos es true
  id_servicios: string[];     // IDs de servicios_publicos que deben atender la emergencia
  es_comunitario?: boolean;   // true = afecta a toda la comunidad, no solo un punto
}

/**
 * Estado al que se quiere mover la incidencia.
 * El tipo garantiza en compilación que solo se aceptan valores del enum ESTADOS_INCIDENCIA.
 */
export interface ChangeStatusDto {
  estado: typeof ESTADOS_INCIDENCIA[keyof typeof ESTADOS_INCIDENCIA];
}
