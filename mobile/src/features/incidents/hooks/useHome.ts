// src/features/incidents/hooks/useHome.ts
// Hook de la pantalla Home. Gestiona la carga de incidencias, los filtros
// de estado y prioridad, la búsqueda libre y la paginación del listado.
// Primera carga muestra spinner; recargas posteriores (al volver a la tab
// o después de cambiar estado) se hacen en silencio sin interrumpir la UI.

import { useState, useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { getIncidents, type Incidencia } from '../../../core/services/incidentsService';

export const PER_PAGE = 10;

export type FiltroEstado    = 'todos'  | Incidencia['estado'];
export type FiltroPrioridad = 'todas' | Incidencia['prioridad'] | 'critica';

export interface HomeStats {
  total:      number;
  activos:    number;
  pendientes: number;
  resueltos:  number;
}

export function useHome() {
  const [incidencias,      setIncidencias]      = useState<Incidencia[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState('');
  const [filtroEstado,     setFiltroEstado]     = useState<FiltroEstado>('todos');
  const [filtroPrioridad,  setFiltroPrioridad]  = useState<FiltroPrioridad>('todas');
  const [busqueda,         setBusqueda]         = useState('');
  const [pagina,           setPagina]           = useState(1);

  const yaInicio = useRef(false);

  const fetchData = useCallback(async (mostrarLoading: boolean) => {
    if (mostrarLoading) setLoading(true);
    setError('');
    try {
      const data = await getIncidents();
      setIncidencias(data);
    } catch {
      if (mostrarLoading) setError('No se pudieron cargar los incidentes.');
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  }, []);

  // Primera carga con spinner; en cada foco posterior recarga en silencio
  useFocusEffect(useCallback(() => {
    const esPrimera = !yaInicio.current;
    yaInicio.current = true;
    fetchData(esPrimera);
  }, [fetchData]));

  // Volver a pág 1 al cambiar filtros
  useEffect(() => { setPagina(1); }, [filtroEstado, filtroPrioridad, busqueda]);

  // ── Stats (sobre lista completa) ──────────────────────────────────────
  const stats: HomeStats = {
    total:      incidencias.length,
    activos:    incidencias.filter((i) => i.estado === 'en_proceso').length,
    pendientes: incidencias.filter((i) => i.estado === 'pendiente').length,
    resueltos:  incidencias.filter((i) => i.estado === 'resuelta').length,
  };

  // ── Filtrado ──────────────────────────────────────────────────────────
  const filtradas = incidencias.filter((i) => {
    if (filtroEstado !== 'todos' && i.estado !== filtroEstado) return false;
    if (filtroPrioridad === 'critica') { if (i.hay_heridos !== 1) return false; }
    else if (filtroPrioridad !== 'todas' && i.prioridad !== filtroPrioridad) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      const match =
        i.nombre_tipo.toLowerCase().includes(q)     ||
        i.nombre_usuario.toLowerCase().includes(q)  ||
        i.descripcion.toLowerCase().includes(q)     ||
        (i.direccion ?? '').toLowerCase().includes(q) ||
        (i.localidad_usuario ?? '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // ── Paginación ────────────────────────────────────────────────────────
  const totalPaginas  = Math.max(1, Math.ceil(filtradas.length / PER_PAGE));
  const paginaActual  = Math.min(pagina, totalPaginas);
  const items         = filtradas.slice((paginaActual - 1) * PER_PAGE, paginaActual * PER_PAGE);

  const irAPagina = (p: number) => setPagina(Math.max(1, Math.min(p, totalPaginas)));

  // Recarga silenciosa (usada por onStatusChanged de IncidentCard)
  const recargar = useCallback(() => { fetchData(false); }, [fetchData]);

  return {
    stats, loading, error, recargar,
    filtroEstado,    setFiltroEstado,
    filtroPrioridad, setFiltroPrioridad,
    busqueda,        setBusqueda,
    items,
    totalFiltradas: filtradas.length,
    pagina: paginaActual,
    totalPaginas,
    irAPagina,
  };
}
