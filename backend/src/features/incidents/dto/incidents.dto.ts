import { ESTADOS_INCIDENCIA } from '../../../shared/constants';

export interface CreateIncidentDto {
  id_tipo_emergencia: string;
  descripcion: string;
  direccion?: string;
  latitud?: number;
  longitud?: number;
  hay_heridos?: boolean;
  cantidad_heridos?: number;
  id_servicios: string[];
  es_comunitario?: boolean;
}

export interface ChangeStatusDto {
  estado: typeof ESTADOS_INCIDENCIA[keyof typeof ESTADOS_INCIDENCIA];
}
