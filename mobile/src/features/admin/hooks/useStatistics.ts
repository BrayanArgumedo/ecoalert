import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { getIncidents, type Incidencia } from '../../../core/services/incidentsService';

export interface StatItem { label: string; count: number; pct: number; }

export interface Statistics {
  total:      number;
  pendientes: number;
  enProceso:  number;
  resueltas:  number;
  tasaRes:    number;
  totalHeridos:      number;
  incConHeridos:     number;
  porTipo:      StatItem[];
  porLocalidad: StatItem[];
  porPrioridad: StatItem[];
  porServicio:  StatItem[];
  porEstado:    StatItem[];
}

function pct(part: number, total: number) {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

function computeStats(data: Incidencia[]): Statistics {
  const total     = data.length;
  const pendientes = data.filter((i) => i.estado === 'pendiente').length;
  const enProceso  = data.filter((i) => i.estado === 'en_proceso').length;
  const resueltas  = data.filter((i) => i.estado === 'resuelta').length;
  const tasaRes    = pct(resueltas, total);

  const totalHeridos  = data.reduce((acc, i) => acc + (i.cantidad_heridos ?? 0), 0);
  const incConHeridos = data.filter((i) => i.hay_heridos === 1).length;

  const groupBy = (key: (i: Incidencia) => string): StatItem[] => {
    const map: Record<string, number> = {};
    data.forEach((i) => {
      const k = key(i) || 'Sin datos';
      map[k] = (map[k] ?? 0) + 1;
    });
    const max = Math.max(...Object.values(map), 1);
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count, pct: Math.round((count / max) * 100) }));
  };

  // Servicios: cada incidencia puede tener varios
  const servicioMap: Record<string, number> = {};
  data.forEach((i) =>
    (i.servicios ?? []).forEach((s) => {
      servicioMap[s.nombre] = (servicioMap[s.nombre] ?? 0) + 1;
    })
  );
  const maxS = Math.max(...Object.values(servicioMap), 1);
  const porServicio: StatItem[] = Object.entries(servicioMap)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count, pct: Math.round((count / maxS) * 100) }));

  const porEstado: StatItem[] = [
    { label: 'Pendiente',  count: pendientes, pct: pct(pendientes, total) },
    { label: 'En proceso', count: enProceso,  pct: pct(enProceso,  total) },
    { label: 'Resuelta',   count: resueltas,  pct: pct(resueltas,  total) },
  ];

  const critica = incConHeridos; // incidencias con hay_heridos === 1
  const alta    = data.filter((i) => i.prioridad === 'alta').length;
  const normal  = total - alta;
  const maxP    = Math.max(critica, alta, normal, 1);
  const porPrioridad: StatItem[] = [
    { label: 'Normal',  count: normal,  pct: Math.round((normal  / maxP) * 100) },
    { label: 'Alta',    count: alta,    pct: Math.round((alta    / maxP) * 100) },
    { label: 'Crítica', count: critica, pct: Math.round((critica / maxP) * 100) },
  ].filter((s) => s.count > 0);

  return {
    total, pendientes, enProceso, resueltas, tasaRes,
    totalHeridos, incConHeridos,
    porTipo:      groupBy((i) => i.nombre_tipo),
    porLocalidad: groupBy((i) => i.localidad_usuario),
    porPrioridad,
    porServicio,
    porEstado,
  };
}

export function useStatistics() {
  const [stats,   setStats]   = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [rawData, setRawData] = useState<Incidencia[]>([]);
  const yaInicio = useRef(false);

  const fetchData = useCallback(async (mostrarLoading: boolean) => {
    if (mostrarLoading) setLoading(true);
    setError('');
    try {
      const data = await getIncidents();
      setRawData(data);
      setStats(computeStats(data));
    } catch {
      if (mostrarLoading) setError('No se pudieron cargar los datos.');
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    const esPrimera = !yaInicio.current;
    yaInicio.current = true;
    fetchData(esPrimera);
  }, [fetchData]));

  return { stats, loading, error, rawData, recargar: () => fetchData(true) };
}
