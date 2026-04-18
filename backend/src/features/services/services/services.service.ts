import { RowDataPacket } from 'mysql2';
import { query } from '../../../infrastructure/database/query';

interface ServicioRow extends RowDataPacket {
  id_servicio: string;
  nombre: string;
  nombre_rol: string;
}

export const getServicesService = async () => {
  return query<ServicioRow[]>(
    `SELECT sp.id_servicio, sp.nombre, r.nombre_rol
     FROM servicios_publicos sp
     JOIN roles r ON sp.id_rol_asignado = r.id_rol
     ORDER BY sp.nombre ASC`
  );
};
