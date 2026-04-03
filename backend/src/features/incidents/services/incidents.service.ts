import { RowDataPacket } from 'mysql2';
import { query, execute } from '../../../infrastructure/database/query';
import { ROLES, ESTADOS_INCIDENCIA } from '../../../shared/constants';
import type { CreateIncidentDto, ChangeStatusDto } from '../dto/incidents.dto';

interface IncidenciaRow extends RowDataPacket {
  id_incidencia: string;
  id_usuario: string;
  nombre_usuario: string;
  id_tipo_emergencia: string;
  nombre_tipo: string;
  descripcion: string;
  latitud: number | null;
  longitud: number | null;
  direccion: string | null;
  prioridad: string;
  es_comunitario: number;
  estado: string;
  fecha_reporte: string;
}

interface ServicioRow extends RowDataPacket {
  id_servicio: string;
  nombre: string;
  nombre_rol: string;
}

interface HistorialRow extends RowDataPacket {
  id_historial: string;
  estado_anterior: string | null;
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

const SELECT_INCIDENCIA = `
  SELECT
    i.id_incidencia, i.id_usuario, u.nombre AS nombre_usuario,
    i.id_tipo_emergencia, t.nombre AS nombre_tipo,
    i.descripcion, i.latitud, i.longitud, i.direccion,
    i.prioridad, i.es_comunitario, i.estado, i.fecha_reporte
  FROM incidencias i
  JOIN usuarios u ON i.id_usuario = u.id_usuario
  JOIN tipos_emergencia t ON i.id_tipo_emergencia = t.id_tipo
`;

const getServiciosDeIncidencia = async (id_incidencia: string) => {
  return query<ServicioRow[]>(
    `SELECT sp.id_servicio, sp.nombre, r.nombre_rol
     FROM incidencia_servicios ise
     JOIN servicios_publicos sp ON ise.id_servicio = sp.id_servicio
     JOIN roles r ON sp.id_rol_asignado = r.id_rol
     WHERE ise.id_incidencia = ?`,
    [id_incidencia]
  );
};

// ── Crear incidencia ────────────────────────────────────────────────────────
export const createIncidentService = async (
  dto: CreateIncidentDto,
  userId: string,
  userRol: string
) => {
  const { id_tipo_emergencia, descripcion, direccion, latitud, longitud, id_servicios, es_comunitario } = dto;

  // Prioridad automática para Representante de Localidad
  const prioridad = userRol === ROLES.REPRESENTANTE ? 'alta' : 'normal';

  await execute(
    `INSERT INTO incidencias
      (id_usuario, id_tipo_emergencia, descripcion, latitud, longitud, direccion, prioridad, es_comunitario)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      id_tipo_emergencia,
      descripcion,
      latitud ?? null,
      longitud ?? null,
      direccion ?? null,
      prioridad,
      es_comunitario ? 1 : 0,
    ]
  );

  // Obtener la incidencia recién creada
  const rows = await query<IncidenciaRow[]>(
    `${SELECT_INCIDENCIA}
     WHERE i.id_usuario = ? AND i.id_tipo_emergencia = ?
     ORDER BY i.fecha_reporte DESC LIMIT 1`,
    [userId, id_tipo_emergencia]
  );

  const incidencia = rows[0];

  // Vincular servicios requeridos
  for (const id_servicio of id_servicios) {
    await execute(
      'INSERT INTO incidencia_servicios (id_incidencia, id_servicio) VALUES (?, ?)',
      [incidencia.id_incidencia, id_servicio]
    );
  }

  const servicios = await getServiciosDeIncidencia(incidencia.id_incidencia);
  return { ...incidencia, servicios };
};

// ── Listar incidencias (filtrado por rol) ───────────────────────────────────
export const getAllIncidentsService = async (userId: string, userRol: string) => {
  let rows: IncidenciaRow[];

  if (userRol === ROLES.ADMIN || userRol === ROLES.REPRESENTANTE) {
    // Admin y Representante ven todas
    rows = await query<IncidenciaRow[]>(`${SELECT_INCIDENCIA} ORDER BY i.fecha_reporte DESC`);
  } else if (
    userRol === ROLES.BOMBERO ||
    userRol === ROLES.POLICIA ||
    userRol === ROLES.PARAMEDICO
  ) {
    // Responders ven solo las que requieren su servicio y están activas
    rows = await query<IncidenciaRow[]>(
      `${SELECT_INCIDENCIA}
       JOIN incidencia_servicios ise ON i.id_incidencia = ise.id_incidencia
       JOIN servicios_publicos sp ON ise.id_servicio = sp.id_servicio
       JOIN roles r ON sp.id_rol_asignado = r.id_rol
       WHERE r.nombre_rol = ? AND i.estado IN ('pendiente', 'en_proceso')
       ORDER BY i.prioridad DESC, i.fecha_reporte ASC`,
      [userRol]
    );
  } else {
    // Ciudadano: solo las suyas
    rows = await query<IncidenciaRow[]>(
      `${SELECT_INCIDENCIA} WHERE i.id_usuario = ? ORDER BY i.fecha_reporte DESC`,
      [userId]
    );
  }

  // Agregar servicios a cada incidencia
  const result = await Promise.all(
    rows.map(async (inc) => {
      const servicios = await getServiciosDeIncidencia(inc.id_incidencia);
      return { ...inc, servicios };
    })
  );

  return result;
};

// ── Ver detalle de una incidencia ───────────────────────────────────────────
export const getIncidentByIdService = async (id: string) => {
  const rows = await query<IncidenciaRow[]>(
    `${SELECT_INCIDENCIA} WHERE i.id_incidencia = ?`,
    [id]
  );
  if (rows.length === 0) return null;

  const servicios = await getServiciosDeIncidencia(id);
  return { ...rows[0], servicios };
};

// ── Cambiar estado ──────────────────────────────────────────────────────────
export const changeStatusService = async (
  incidentId: string,
  dto: ChangeStatusDto,
  userId: string,
  userRol: string
) => {
  const rows = await query<IncidenciaRow[]>(
    `${SELECT_INCIDENCIA} WHERE i.id_incidencia = ?`,
    [incidentId]
  );

  if (rows.length === 0) return null;

  const incidencia = rows[0];

  // Responders solo pueden cambiar estado si su rol está en los servicios asignados
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

  // Registrar en historial
  await execute(
    `INSERT INTO historial_estados (id_incidencia, estado_anterior, estado_nuevo, id_usuario)
     VALUES (?, ?, ?, ?)`,
    [incidentId, incidencia.estado, dto.estado, userId]
  );

  // Actualizar estado
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

// ── Historial de estados ────────────────────────────────────────────────────
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
