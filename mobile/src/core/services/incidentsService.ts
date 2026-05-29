// src/core/services/incidentsService.ts
// Servicio de incidencias: define los tipos de datos y las funciones
// que consumen los endpoints del módulo de incidencias del backend.

import { api } from './api';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface Servicio {
  id_servicio: string;
  nombre: string;
  nombre_rol: string;  // Rol del responder asignado (Bombero, Policía, etc.)
  aceptada: number;    // 1 = el responder ya confirmó que va a atender
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
  icono_tipo: string | null;
  descripcion: string;
  latitud: number | null;
  longitud: number | null;
  direccion: string | null;
  hay_heridos: number;          // 1 = sí, 0 = no (viene como tinyint desde MySQL)
  cantidad_heridos: number | null;
  prioridad: 'normal' | 'alta' | 'critica';
  estado: 'pendiente' | 'en_proceso' | 'resuelta';
  fecha_reporte: string;
  servicios: Servicio[];        // Servicios vinculados a esta incidencia
}

export interface CreateIncidentPayload {
  id_tipo_emergencia: string;
  descripcion: string;
  direccion?: string;
  hay_heridos?: boolean;
  cantidad_heridos?: number;
  id_servicios: string[];       // IDs de los servicios públicos a notificar
}

export interface HistorialItem {
  id_historial: string;
  estado_anterior: string | null;  // null en el primer cambio de estado
  estado_nuevo: string;
  id_usuario: string;
  nombre_usuario: string;
  fecha_cambio: string;
}

// ── Llamadas a la API ─────────────────────────────────────────────────────────

// Obtiene los servicios públicos disponibles para el selector al crear una incidencia
export const getServices = async (): Promise<Servicio[]> => {
  const { data } = await api.get('/services');
  return data.data;
};

// Lista las incidencias visibles para el usuario según su rol.
// Los filtros opcionales se envían como query string (?prioridad=alta&estado=pendiente).
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

// El responder confirma que va a atender su servicio asignado en esta incidencia
export const acceptIncident = async (id: string): Promise<Incidencia> => {
  const { data } = await api.patch(`/incidents/${id}/accept`);
  return data.data;
};

export const getIncidentById = async (id: string): Promise<Incidencia> => {
  const { data } = await api.get(`/incidents/${id}`);
  return data.data;
};

// Retorna el historial de cambios de estado ordenado cronológicamente
export const getIncidentHistory = async (id: string): Promise<HistorialItem[]> => {
  const { data } = await api.get(`/incidents/${id}/history`);
  return data.data;
};
