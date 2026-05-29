// src/features/services/services/services.service.ts
// Lógica de negocio del módulo de servicios públicos.
// Los servicios (Bomberos, Policía, Paramédicos) son un catálogo fijo definido
// en las migraciones. Este módulo solo expone la consulta de lectura que el
// mobile necesita para poblar el selector al crear una incidencia.

import { RowDataPacket } from 'mysql2';
import { query } from '../../../infrastructure/database/query';

interface ServicioRow extends RowDataPacket {
  id_servicio: string;
  nombre: string;
  nombre_rol: string;  // Rol del usuario responsable de atender este servicio
}

// ── Consulta ──────────────────────────────────────────────────────────────────

// Retorna todos los servicios con el rol que los atiende, ordenados alfabéticamente.
// El JOIN con roles permite al mobile mostrar qué tipo de personal responderá.
export const getServicesService = async () => {
  return query<ServicioRow[]>(
    `SELECT sp.id_servicio, sp.nombre, r.nombre_rol
     FROM servicios_publicos sp
     JOIN roles r ON sp.id_rol_asignado = r.id_rol
     ORDER BY sp.nombre ASC`
  );
};
