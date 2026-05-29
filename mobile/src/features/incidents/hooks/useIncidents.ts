// src/features/incidents/hooks/useIncidents.ts
// Hook de la pantalla Incidencias (tab de responders).
// Maneja la carga y el filtro por estado. El filtro 'critica' es local:
// trae todas las incidencias y filtra las que tienen hay_heridos === 1,
// ya que el backend no tiene un estado "critica" — es una vista del mobile.

import { useState, useCallback } from 'react';
import { getIncidents, type Incidencia } from '../../../core/services/incidentsService';

export type FiltroEstado = 'todos' | 'pendiente' | 'en_proceso' | 'resuelta' | 'critica';

export const FILTROS: { key: FiltroEstado; label: string }[] = [
  { key: 'todos',      label: 'Todos' },
  { key: 'pendiente',  label: 'Pendiente' },
  { key: 'en_proceso', label: 'En proceso' },
  { key: 'resuelta',   label: 'Resuelta' },
  { key: 'critica',    label: 'Crítica' },
];

export function useIncidents() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [filtro,      setFiltro]      = useState<FiltroEstado>('todos');
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState('');

  const cargar = useCallback(async (esRefresh = false) => {
    if (esRefresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const esCritica = filtro === 'critica';
      const data = await getIncidents(
        filtro === 'todos' || esCritica ? undefined : { estado: filtro }
      );
      setIncidencias(esCritica ? data.filter((i) => i.hay_heridos === 1) : data);
    } catch {
      setError('No se pudieron cargar los incidentes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filtro]);

  return { incidencias, filtro, setFiltro, loading, refreshing, error, cargar };
}
