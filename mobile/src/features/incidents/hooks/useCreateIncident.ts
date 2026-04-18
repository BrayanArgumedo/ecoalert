import { useState, useEffect } from 'react';
import { getServices, createIncident, type Servicio } from '../../../core/services/incidentsService';
import { getEmergencyTypes, type TipoEmergencia } from '../../../core/services/emergencyTypesService';

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

  // Estado de envío
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [exito,   setExito]   = useState(false);

  useEffect(() => {
    Promise.all([getEmergencyTypes(), getServices()])
      .then(([t, s]) => { setTipos(t); setServicios(s); })
      .catch(() => setError('No se pudieron cargar los datos. Verifica tu conexión.'))
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
    // Envío
    loading, error, exito,
    handleSubmit, resetForm,
  };
}
