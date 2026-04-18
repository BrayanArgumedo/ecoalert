import { useState, useCallback } from 'react';
import { getIncidents, type Incidencia } from '../../../core/services/incidentsService';

export type FiltroEstado = 'todos' | 'pendiente' | 'en_proceso' | 'resuelta';

export const FILTROS: { key: FiltroEstado; label: string }[] = [
  { key: 'todos',      label: 'Todos' },
  { key: 'pendiente',  label: 'Pendiente' },
  { key: 'en_proceso', label: 'En proceso' },
  { key: 'resuelta',   label: 'Resuelta' },
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
      const data = await getIncidents(filtro === 'todos' ? undefined : { estado: filtro });
      setIncidencias(data);
    } catch {
      setError('No se pudieron cargar los incidentes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filtro]);

  return { incidencias, filtro, setFiltro, loading, refreshing, error, cargar };
}
