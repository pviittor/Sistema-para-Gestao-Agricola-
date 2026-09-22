import { Router } from 'express';
import { container } from '../core/di/container';
import UsuarioHasRoleController from '../controllers/UsuarioHasRoleController';
import { requirePermission } from '../middleware/authorization';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Resolver controller via DI (lazy resolution)
const getController = () => container.resolve(UsuarioHasRoleController);

/**
 * GET /api/usuario-roles
 * 
 * Lista todas as associações entre usuários e roles.
 * 
 * Permissão necessária: usuario.read
 */
router.get('/', requirePermission('usuario.read'), asyncHandler(async (req, res) => {
  await getController().index(req, res);
}));

/**
 * POST /api/usuario-roles
 * 
 * Cria uma nova associação entre usuário e role.
 * 
 * Permissão necessária: usuario.update
 */
router.post('/', requirePermission('usuario.update'), asyncHandler(async (req, res) => {
  await getController().create(req, res);
}));

/**
 * DELETE /api/usuario-roles/:usuarioId/:roleId
 * 
 * Remove uma associação entre usuário e role.
 * 
 * Permissão necessária: usuario.update
 */
router.delete('/:usuarioId/:roleId', requirePermission('usuario.update'), asyncHandler(async (req, res) => {
  await getController().delete(req, res);
}));

export default router;
