import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IPermissaoController } from '../controllers/interfaces/IPermissaoController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreatePermissaoDto, UpdatePermissaoDto } from '../application/dto/permissao';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getPermissaoController = (): IPermissaoController => {
  return container.resolve<IPermissaoController>(TYPES.IPermissaoController);
};

/**
 * GET /api/permissoes
 * 
 * Lista todas as permissões.
 * 
 * Permissão necessária: permissao.read
 */
router.get('/', requirePermission('permissao.read'), asyncHandler(async (req, res) => {
  await getPermissaoController().index(req, res);
}));

/**
 * GET /api/permissoes/:id
 * 
 * Retorna uma permissão específica por ID.
 * 
 * Permissão necessária: permissao.read
 */
router.get('/:id', requirePermission('permissao.read'), asyncHandler(async (req, res) => {
  await getPermissaoController().show(req, res);
}));

/**
 * POST /api/permissoes
 * 
 * Cria uma nova permissão.
 * 
 * Body: CreatePermissaoDto
 * Response: PermissaoResponseDto
 * Permissão necessária: permissao.create
 */
router.post(
  '/',
  requirePermission('permissao.create'),
  validateDto(CreatePermissaoDto),
  asyncHandler(async (req, res) => {
    await getPermissaoController().create(req, res);
  })
);

/**
 * PUT /api/permissoes/:id
 * 
 * Atualiza uma permissão existente.
 * 
 * Body: UpdatePermissaoDto
 * Response: PermissaoResponseDto
 * Permissão necessária: permissao.update
 */
router.put(
  '/:id',
  requirePermission('permissao.update'),
  validateDtoUpdate(UpdatePermissaoDto),
  asyncHandler(async (req, res) => {
    await getPermissaoController().update(req, res);
  })
);

/**
 * DELETE /api/permissoes/:id
 * 
 * Remove uma permissão.
 * 
 * Permissão necessária: permissao.delete
 */
router.delete('/:id', requirePermission('permissao.delete'), asyncHandler(async (req, res) => {
  await getPermissaoController().delete(req, res);
}));

export default router;
