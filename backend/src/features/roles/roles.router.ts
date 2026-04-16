import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { requireRoles } from '../../core/middleware/roles.middleware';
import { ROLES } from '../../shared/constants';
import { query } from '../../infrastructure/database/query';
import { RowDataPacket } from 'mysql2';
import { ok, serverError } from '../../shared/utils/response';

interface RolRow extends RowDataPacket {
  id_rol: string;
  nombre_rol: string;
  descripcion: string | null;
}

const router = Router();

router.get(
  '/',
  authMiddleware,
  requireRoles(ROLES.ADMIN),
  async (_req: Request, res: Response) => {
    try {
      const roles = await query<RolRow[]>(
        'SELECT id_rol, nombre_rol, descripcion FROM roles ORDER BY nombre_rol'
      );
      ok(res, roles);
    } catch {
      serverError(res);
    }
  }
);

export default router;
