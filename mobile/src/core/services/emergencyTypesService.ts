// src/core/services/emergencyTypesService.ts
// Servicio de tipos de emergencia: funciones que consumen el catálogo
// de tipos del backend (Inundación, Incendio, Derrame químico, etc.).

import { api } from './api';

export interface TipoEmergencia {
  id_tipo: string;
  nombre: string;
  descripcion: string | null;
  icono: string | null;  // Nombre del ícono para Ionicons en el mobile
}

// ── Llamadas a la API ─────────────────────────────────────────────────────────

// Lista todos los tipos disponibles — usado para poblar el selector al reportar
export const getEmergencyTypes = async (): Promise<TipoEmergencia[]> => {
  const { data } = await api.get('/emergency-types');
  return data.data;
};

export const createEmergencyType = async (payload: {
  nombre: string;
  descripcion?: string;
  icono?: string;
}): Promise<TipoEmergencia> => {
  const { data } = await api.post('/emergency-types', payload);
  return data.data;
};

export const updateEmergencyType = async (
  id: string,
  payload: { nombre?: string; descripcion?: string; icono?: string | null }
): Promise<TipoEmergencia> => {
  const { data } = await api.patch(`/emergency-types/${id}`, payload);
  return data.data;
};

export const deleteEmergencyType = async (id: string): Promise<void> => {
  await api.delete(`/emergency-types/${id}`);
};
