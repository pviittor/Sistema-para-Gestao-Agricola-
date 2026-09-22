import { Router } from 'express';
import { container } from '../core/di/container';
import RoleHasPermissaoController from '../controllers/RoleHasPermissaoController';
import { requirePermission } from '../middleware/authorization';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Resolver controller via DI (lazy resolution)
const getController = () => container.resolve(RoleHasPermissaoController);

/**
 * GET /api/roleHasPermissoes
 * 
 * Lista todas as associações entre roles e permissões.
 * 
 * Permissão necessária: role.read
 */
router.get('/', requirePermission('role.read'), asyncHandler(async (req, res) => {
  await getController().index(req, res);
}));

/**
 * POST /api/roleHasPermissoes
 * 
 * Cria uma nova associação entre role e permissão.
 * 
 * Permissão necessária: role.update
 */
router.post('/', requirePermission('role.update'), asyncHandler(async (req, res) => {
  await getController().create(req, res);
}));

/**
 * DELETE /api/roleHasPermissoes/:roleId/:permissaoId
 * 
 * Remove uma associação entre role e permissão.
 * 
 * Permissão necessária: role.update
 */
router.delete('/:roleId/:permissaoId', requirePermission('role.update'), asyncHandler(async (req, res) => {
  await getController().delete(req, res);
}));

export default router;
