// src/features/incidents/services/incidents.service.ts
// Lógica de negocio del módulo de incidencias.
// Gestiona la creación, consulta filtrada por rol, cambio de estado,
// aceptación por parte de responders y el historial de cambios.

import { RowDataPacket } from 'mysql2';
import { query, execute } from '../../../infrastructure/database/query';
import { ROLES } from '../../../shared/constants';
import type { CreateIncidentDto, ChangeStatusDto } from '../dto/incidents.dto';

// ── Tipos de las filas de BD ──────────────────────────────────────────────────

interface IncidenciaRow extends RowDataPacket {
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
  hay_heridos: number;         // 1 = sí, 0 = no (MySQL tinyint)
  cantidad_heridos: number | null;
  prioridad: string;           // 'normal' | 'alta' — asignada automáticamente al crear
  es_comunitario: number;      // 1 = afecta a toda la comunidad, 0 = incidente puntual
  estado: string;              // 'pendiente' | 'en_proceso' | 'resuelta'
  fecha_reporte: string;
}

interface ServicioRow extends RowDataPacket {
  id_servicio: string;
  nombre: string;
  nombre_rol: string;  // Rol encargado de atender este servicio (Bombero, Policía, etc.)
  aceptada: number;    // 1 = el responder ya confirmó que va a atender
}

interface HistorialRow extends RowDataPacket {
  id_historial: string;
  estado_anterior: string | null;  // null en el primer cambio de estado
  estado_nuevo: string;
  id_usuario: string;
  nombre_usuario: string;
  fecha_cambio: string;
}

interface RolServicioRow extends RowDataPacket {
  id_servicio: string;
  nombre: string;
  id_rol_asignado: string;
}

// ── Query base y helper de servicios ─────────────────────────────────────────

// Fragmento SELECT reutilizado por todas las consultas del módulo.
// Hace los JOINs necesarios para obtener nombre del usuario y tipo de emergencia.
const SELECT_INCIDENCIA = `
  SELECT
    i.id_incidencia, i.id_usuario, u.nombre AS nombre_usuario,
    u.localidad AS localidad_usuario,
    i.id_tipo_emergencia, t.nombre AS nombre_tipo, t.icono AS icono_tipo,
    i.descripcion, i.latitud, i.longitud, i.direccion,
    i.hay_heridos, i.cantidad_heridos,
    i.prioridad, i.es_comunitario, i.estado, i.fecha_reporte
  FROM incidencias i
  JOIN usuarios u ON i.id_usuario = u.id_usuario
  JOIN tipos_emergencia t ON i.id_tipo_emergencia = t.id_tipo
`;

// Obtiene los servicios vinculados a una incidencia junto con el rol responsable
// y si ya fueron aceptados. Se llama después de cada consulta principal para
// componer el objeto final { ...incidencia, servicios }.
const getServiciosDeIncidencia = async (id_incidencia: string) => {
  return query<ServicioRow[]>(
    `SELECT sp.id_servicio, sp.nombre, r.nombre_rol, ise.aceptada
     FROM incidencia_servicios ise
     JOIN servicios_publicos sp ON ise.id_servicio = sp.id_servicio
     JOIN roles r ON sp.id_rol_asignado = r.id_rol
     WHERE ise.id_incidencia = ?`,
    [id_incidencia]
  );
};

// ── Crear incidencia ──────────────────────────────────────────────────────────

export const createIncidentService = async (
  dto: CreateIncidentDto,
  userId: string,
  userRol: string
) => {
  const {
    id_tipo_emergencia, descripcion, direccion, latitud, longitud,
    hay_heridos, cantidad_heridos, id_servicios, es_comunitario,
  } = dto;

  // La prioridad se asigna automáticamente según el rol del reportante:
  // Representante → 'alta' para que los responders la vean primero en la lista
  const prioridad = userRol === ROLES.REPRESENTANTE ? 'alta' : 'normal';

  // 1. Insertar la incidencia en la BD
  await execute(
    `INSERT INTO incidencias
      (id_usuario, id_tipo_emergencia, descripcion, latitud, longitud, direccion,
       hay_heridos, cantidad_heridos, prioridad, es_comunitario)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      id_tipo_emergencia,
      descripcion,
      latitud ?? null,
      longitud ?? null,
      direccion ?? null,
      hay_heridos ? 1 : 0,
      hay_heridos && cantidad_heridos ? cantidad_heridos : null,
      prioridad,
      es_comunitario ? 1 : 0,
    ]
  );

  // 2. Recuperar la incidencia recién insertada (MySQL no retorna el registro en INSERT)
  const rows = await query<IncidenciaRow[]>(
    `${SELECT_INCIDENCIA}
     WHERE i.id_usuario = ? AND i.id_tipo_emergencia = ?
     ORDER BY i.fecha_reporte DESC LIMIT 1`,
    [userId, id_tipo_emergencia]
  );
  const incidencia = rows[0];

  // 3. Vincular cada servicio seleccionado por el usuario a la incidencia
  for (const id_servicio of id_servicios) {
    await execute(
      'INSERT INTO incidencia_servicios (id_incidencia, id_servicio) VALUES (?, ?)',
      [incidencia.id_incidencia, id_servicio]
    );
  }

  const servicios = await getServiciosDeIncidencia(incidencia.id_incidencia);
  return { ...incidencia, servicios };
};

// ── Listar incidencias (filtrado por rol) ─────────────────────────────────────

export const getAllIncidentsService = async (
  userId: string,
  userRol: string,
  userLocalidad: string | null,
  filtros?: { prioridad?: string; estado?: string }
) => {
  let rows: IncidenciaRow[];

  if (userRol === ROLES.ADMIN) {
    // Admin ve todas las incidencias del sistema
    rows = await query<IncidenciaRow[]>(`${SELECT_INCIDENCIA} ORDER BY i.fecha_reporte DESC`);

  } else if (userRol === ROLES.REPRESENTANTE) {
    // Representante ve las suyas propias + todas las reportadas en su localidad,
    // ordenadas por prioridad para atender primero las más urgentes
    rows = await query<IncidenciaRow[]>(
      `${SELECT_INCIDENCIA}
       WHERE (i.id_usuario = ? OR u.localidad = ?)
       ORDER BY i.prioridad DESC, i.fecha_reporte DESC`,
      [userId, userLocalidad ?? '']
    );

  } else if (
    userRol === ROLES.BOMBERO ||
    userRol === ROLES.POLICIA ||
    userRol === ROLES.PARAMEDICO
  ) {
    // Responders (Bombero, Policía, Paramédico) solo ven las incidencias
    // que incluyen su servicio, ordenadas por prioridad
    rows = await query<IncidenciaRow[]>(
      `${SELECT_INCIDENCIA}
       JOIN incidencia_servicios ise ON i.id_incidencia = ise.id_incidencia
       JOIN servicios_publicos sp ON ise.id_servicio = sp.id_servicio
       JOIN roles r2 ON sp.id_rol_asignado = r2.id_rol
       WHERE r2.nombre_rol = ?
       ORDER BY i.prioridad DESC, i.fecha_reporte DESC`,
      [userRol]
    );

  } else {
    // Ciudadano: solo ve sus propias incidencias
    rows = await query<IncidenciaRow[]>(
      `${SELECT_INCIDENCIA} WHERE i.id_usuario = ? ORDER BY i.fecha_reporte DESC`,
      [userId]
    );
  }

  // Filtros opcionales de query string (?prioridad=alta&estado=pendiente)
  if (filtros?.prioridad) {
    rows = rows.filter((r) => r.prioridad === filtros.prioridad);
  }
  if (filtros?.estado) {
    rows = rows.filter((r) => r.estado === filtros.estado);
  }

  // Agregar la lista de servicios a cada incidencia en paralelo
  const result = await Promise.all(
    rows.map(async (inc) => {
      const servicios = await getServiciosDeIncidencia(inc.id_incidencia);
      return { ...inc, servicios };
    })
  );

  return result;
};

// ── Ver detalle de una incidencia ─────────────────────────────────────────────

export const getIncidentByIdService = async (id: string) => {
  const rows = await query<IncidenciaRow[]>(
    `${SELECT_INCIDENCIA} WHERE i.id_incidencia = ?`,
    [id]
  );
  if (rows.length === 0) return null;

  const servicios = await getServiciosDeIncidencia(id);
  return { ...rows[0], servicios };
};

// ── Cambiar estado ────────────────────────────────────────────────────────────

export const changeStatusService = async (
  incidentId: string,
  dto: ChangeStatusDto,
  userId: string,
  userRol: string
) => {
  // 1. Verificar que la incidencia existe
  const rows = await query<IncidenciaRow[]>(
    `${SELECT_INCIDENCIA} WHERE i.id_incidencia = ?`,
    [incidentId]
  );
  if (rows.length === 0) return null;
  const incidencia = rows[0];

  // 2. Los responders solo pueden cambiar el estado si tienen un servicio asignado.
  //    Admin y Representante pueden cambiarlo sin restricción adicional.
  if (userRol !== ROLES.ADMIN && userRol !== ROLES.REPRESENTANTE) {
    const servicios = await query<RolServicioRow[]>(
      `SELECT sp.id_servicio, sp.nombre, sp.id_rol_asignado
       FROM incidencia_servicios ise
       JOIN servicios_publicos sp ON ise.id_servicio = sp.id_servicio
       JOIN roles r ON sp.id_rol_asignado = r.id_rol
       WHERE ise.id_incidencia = ? AND r.nombre_rol = ?`,
      [incidentId, userRol]
    );
    if (servicios.length === 0) {
      throw new Error('No tienes un servicio asignado en esta incidencia');
    }
  }

  // 3. Registrar el cambio en el historial antes de aplicarlo
  await execute(
    `INSERT INTO historial_estados (id_incidencia, estado_anterior, estado_nuevo, id_usuario)
     VALUES (?, ?, ?, ?)`,
    [incidentId, incidencia.estado, dto.estado, userId]
  );

  // 4. Aplicar el nuevo estado
  await execute(
    'UPDATE incidencias SET estado = ? WHERE id_incidencia = ?',
    [dto.estado, incidentId]
  );

  const updated = await query<IncidenciaRow[]>(
    `${SELECT_INCIDENCIA} WHERE i.id_incidencia = ?`,
    [incidentId]
  );
  const servicios = await getServiciosDeIncidencia(incidentId);
  return { ...updated[0], servicios };
};

// ── Aceptar incidencia ────────────────────────────────────────────────────────

export const aceptarIncidenteService = async (incidentId: string, userRol: string) => {
  // 1. Verificar que el rol del responder está en los servicios asignados
  const servicios = await query<RolServicioRow[]>(
    `SELECT sp.id_servicio, sp.nombre, sp.id_rol_asignado
     FROM incidencia_servicios ise
     JOIN servicios_publicos sp ON ise.id_servicio = sp.id_servicio
     JOIN roles r ON sp.id_rol_asignado = r.id_rol
     WHERE ise.id_incidencia = ? AND r.nombre_rol = ?`,
    [incidentId, userRol]
  );
  if (servicios.length === 0) {
    throw new Error('No tienes un servicio asignado en esta incidencia');
  }

  const id_servicio = servicios[0].id_servicio;

  // 2. Marcar el servicio como aceptado y registrar el momento de aceptación
  await execute(
    `UPDATE incidencia_servicios
     SET aceptada = TRUE, aceptada_en = NOW()
     WHERE id_incidencia = ? AND id_servicio = ?`,
    [incidentId, id_servicio]
  );

  // 3. Retornar la incidencia actualizada con todos sus servicios
  const rows = await query<IncidenciaRow[]>(
    `${SELECT_INCIDENCIA} WHERE i.id_incidencia = ?`,
    [incidentId]
  );
  const serviciosActualizados = await getServiciosDeIncidencia(incidentId);
  return { ...rows[0], servicios: serviciosActualizados };
};

// ── Historial de estados ──────────────────────────────────────────────────────

// Retorna todos los cambios de estado de una incidencia en orden cronológico,
// incluyendo quién realizó cada cambio.
export const getHistoryService = async (incidentId: string) => {
  return query<HistorialRow[]>(
    `SELECT h.id_historial, h.estado_anterior, h.estado_nuevo,
            h.id_usuario, u.nombre AS nombre_usuario, h.fecha_cambio
     FROM historial_estados h
     JOIN usuarios u ON h.id_usuario = u.id_usuario
     WHERE h.id_incidencia = ?
     ORDER BY h.fecha_cambio ASC`,
    [incidentId]
  );
};
