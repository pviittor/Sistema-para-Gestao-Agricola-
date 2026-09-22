import { Router } from 'express';
import { container } from '../core/di/container';
import UsuarioHasSubUsuarioController from '../controllers/UsuarioHasSubUsuarioController';
import { requirePermission } from '../middleware/authorization';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Resolver controller via DI (lazy resolution)
const getController = () => container.resolve(UsuarioHasSubUsuarioController);

/**
 * GET /api/usuario-subusuarios
 * 
 * Lista todas as associações entre usuários e sub-usuários.
 * 
 * Permissão necessária: usuario.read
 */
router.get('/', requirePermission('usuario.read'), asyncHandler(async (req, res) => {
  await getController().index(req, res);
}));

/**
 * POST /api/usuario-subusuarios
 * 
 * Cria uma nova associação entre usuário e sub-usuário.
 * 
 * Permissão necessária: usuario.update
 */
router.post('/', requirePermission('usuario.update'), asyncHandler(async (req, res) => {
  await getController().create(req, res);
}));

/**
 * DELETE /api/usuario-subusuarios/:usuarioId/:subUsuarioId
 * 
 * Remove uma associação entre usuário e sub-usuário.
 * 
 * Permissão necessária: usuario.update
 */
router.delete('/:usuarioId/:subUsuarioId', requirePermission('usuario.update'), asyncHandler(async (req, res) => {
  await getController().delete(req, res);
}));

export default router;
