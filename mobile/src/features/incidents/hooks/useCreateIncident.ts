// src/features/incidents/hooks/useCreateIncident.ts
// Hook del formulario de reporte de incidencias.
// Carga los tipos de emergencia y servicios disponibles al montar.
// La dirección se geocodifica en tiempo real con debounce de 700ms usando
// Nominatim (OpenStreetMap) para obtener coordenadas sin coste adicional.

import { useState, useEffect, useRef } from 'react';
import { getServices, createIncident, type Servicio } from '../../../core/services/incidentsService';
import { getEmergencyTypes, type TipoEmergencia } from '../../../core/services/emergencyTypesService';

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const q = encodeURIComponent(`${address}, Cereté, Córdoba, Colombia`);
    const res = await fetch(`${NOMINATIM}?q=${q}&format=json&limit=1`, {
      headers: { 'User-Agent': 'EcoAlert/1.0 (bargumedo0720@gmail.com)' },
    });
    const data = await res.json();
    if (data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    return null;
  } catch {
    return null;
  }
}

export function useCreateIncident() {
  // Datos del API
  const [tipos,       setTipos]       = useState<TipoEmergencia[]>([]);
  const [servicios,   setServicios]   = useState<Servicio[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Campos del formulario
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoEmergencia | null>(null);
  const [descripcion,      setDescripcion]      = useState('');
  const [direccion,        setDireccion]        = useState('');
  const [hayHeridos,       setHayHeridos]       = useState(false);
  const [cantHeridos,      setCantHeridos]      = useState('');
  const [serviciosSel,     setServiciosSel]     = useState<string[]>([]);

  // Estado UI del modal de tipo
  const [modalTipo,    setModalTipo]    = useState(false);
  const [busquedaTipo, setBusquedaTipo] = useState('');

  // Geocodificación en tiempo real de la dirección
  const [geocodedCoords, setGeocodedCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [geocodingAddr,  setGeocodingAddr]  = useState(false);
  const [geocodeError,   setGeocodeError]   = useState(false);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estado de envío
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [exito,   setExito]   = useState(false);

  // Geocodificar al cambiar dirección (debounce 700ms)
  useEffect(() => {
    const trimmed = direccion.trim();
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);

    if (!trimmed) {
      setGeocodedCoords(null);
      setGeocodeError(false);
      setGeocodingAddr(false);
      return;
    }

    setGeocodingAddr(true);
    setGeocodeError(false);

    geocodeTimer.current = setTimeout(async () => {
      const result = await geocodeAddress(trimmed);
      setGeocodedCoords(result);
      setGeocodeError(result === null);
      setGeocodingAddr(false);
    }, 700);

    return () => { if (geocodeTimer.current) clearTimeout(geocodeTimer.current); };
  }, [direccion]);

  useEffect(() => {
    Promise.allSettled([getEmergencyTypes(), getServices()])
      .then(([tiposRes, serviciosRes]) => {
        if (tiposRes.status === 'fulfilled')    setTipos(tiposRes.value);
        if (serviciosRes.status === 'fulfilled') setServicios(serviciosRes.value);
        if (tiposRes.status === 'rejected' || serviciosRes.status === 'rejected')
          setError('No se pudieron cargar todos los datos. Verifica tu conexión.');
      })
      .finally(() => setLoadingData(false));
  }, []);

  const tiposFiltrados = tipos.filter((t) =>
    t.nombre.toLowerCase().includes(busquedaTipo.toLowerCase())
  );

  const toggleServicio = (id: string) => {
    setServiciosSel((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
    setError('');
  };

  const seleccionarTipo = (tipo: TipoEmergencia) => {
    setTipoSeleccionado(tipo);
    setBusquedaTipo('');
    setModalTipo(false);
    setError('');
  };

  const resetForm = () => {
    setTipoSeleccionado(null);
    setDescripcion('');
    setDireccion('');
    setHayHeridos(false);
    setCantHeridos('');
    setServiciosSel([]);
    setExito(false);
    setError('');
    setGeocodedCoords(null);
    setGeocodeError(false);
  };

  const handleSubmit = async () => {
    setError('');
    if (!tipoSeleccionado)                              { setError('Selecciona el tipo de emergencia.'); return; }
    if (!descripcion.trim())                            { setError('La descripción es obligatoria.'); return; }
    if (serviciosSel.length === 0)                      { setError('Selecciona al menos un servicio requerido.'); return; }
    if (hayHeridos && (!cantHeridos || Number(cantHeridos) < 1)) { setError('Indica cuántos heridos hay.'); return; }

    setLoading(true);
    try {
      await createIncident({
        id_tipo_emergencia: tipoSeleccionado.id_tipo,
        descripcion:        descripcion.trim(),
        direccion:          direccion.trim() || undefined,
        hay_heridos:        hayHeridos,
        cantidad_heridos:   hayHeridos ? Number(cantHeridos) : undefined,
        id_servicios:       serviciosSel,
      });
      setExito(true);
    } catch (err: any) {
      const status = err?.response?.status;
      setError(status === 400
        ? (err?.response?.data?.message ?? 'Datos inválidos.')
        : 'Error al reportar. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    // Datos API
    tipos, servicios, loadingData,
    // Campos
    tipoSeleccionado, descripcion, setDescripcion,
    direccion, setDireccion,
    hayHeridos, setHayHeridos,
    cantHeridos, setCantHeridos,
    serviciosSel, toggleServicio,
    // Modal tipo
    modalTipo, setModalTipo,
    busquedaTipo, setBusquedaTipo,
    tiposFiltrados, seleccionarTipo,
    // Geocodificación
    geocodedCoords, geocodingAddr, geocodeError,
    // Envío
    loading, error, exito,
    handleSubmit, resetForm,
  };
}
