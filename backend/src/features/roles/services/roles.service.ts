import { RowDataPacket } from 'mysql2';
import { query } from '../../../infrastructure/database/query';

interface RolRow extends RowDataPacket {
  id_rol: string;
  nombre_rol: string;
  descripcion: string | null;
}

export const getRolesService = async () => {
  return query<RolRow[]>(
    'SELECT id_rol, nombre_rol, descripcion FROM roles ORDER BY nombre_rol'
  );
};
