import { api } from './api';

export interface Servicio {
  id_servicio: string;
  nombre: string;
  nombre_rol: string;
}

export interface TipoEmergencia {
  id_tipo: string;
  nombre: string;
  descripcion: string | null;
  icono: string | null;
}

export interface Incidencia {
  id_incidencia: string;
  id_usuario: string;
  nombre_usuario: string;
  localidad_usuario: string;
  id_tipo_emergencia: string;
  nombre_tipo: string;
  descripcion: string;
  latitud: number | null;
  longitud: number | null;
  direccion: string | null;
  hay_heridos: number;
  cantidad_heridos: number | null;
  prioridad: 'normal' | 'alta' | 'critica';
  estado: 'pendiente' | 'en_proceso' | 'resuelta';
  fecha_reporte: string;
  servicios: Servicio[];
}

export interface CreateIncidentPayload {
  id_tipo_emergencia: string;
  descripcion: string;
  direccion?: string;
  hay_heridos?: boolean;
  cantidad_heridos?: number;
  id_servicios: string[];
}

export const getServices = async (): Promise<Servicio[]> => {
  const { data } = await api.get('/services');
  return data.data;
};

export const getIncidents = async (filtros?: {
  prioridad?: string;
  estado?: string;
}): Promise<Incidencia[]> => {
  const params = new URLSearchParams();
  if (filtros?.prioridad) params.append('prioridad', filtros.prioridad);
  if (filtros?.estado)    params.append('estado', filtros.estado);
  const { data } = await api.get(`/incidents?${params.toString()}`);
  return data.data;
};

export const createIncident = async (
  payload: CreateIncidentPayload
): Promise<Incidencia> => {
  const { data } = await api.post('/incidents', payload);
  return data.data;
};

export const changeIncidentStatus = async (
  id: string,
  estado: Incidencia['estado']
): Promise<Incidencia> => {
  const { data } = await api.patch(`/incidents/${id}/status`, { estado });
  return data.data;
};
