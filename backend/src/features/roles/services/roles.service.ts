// src/features/roles/services/roles.service.ts
// Lógica de negocio del módulo de roles.
// Los roles son un catálogo fijo definido en las migraciones; no se crean
// ni eliminan desde la API. Este servicio solo expone la consulta de lectura.

import { RowDataPacket } from 'mysql2';
import { query } from '../../../infrastructure/database/query';

interface RolRow extends RowDataPacket {
  id_rol: string;
  nombre_rol: string;   // Debe coincidir con los valores del objeto ROLES en constants.ts
  descripcion: string | null;
}

// ── Consulta ──────────────────────────────────────────────────────────────────

// Retorna el catálogo completo de roles ordenado alfabéticamente.
// El Admin lo usa para poblar el selector al cambiar el rol de un usuario.
export const getRolesService = async () => {
  return query<RolRow[]>(
    'SELECT id_rol, nombre_rol, descripcion FROM roles ORDER BY nombre_rol'
  );
};
