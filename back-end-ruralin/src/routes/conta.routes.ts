import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IContaController } from '../controllers/interfaces/IContaController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateContaDto, UpdateContaDto } from '../application/dto/conta';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getContaController = (): IContaController => {
  return container.resolve<IContaController>(TYPES.IContaController);
};

/**
 * GET /api/contas
 * 
 * Lista todas as contas do tenant atual.
 * 
 * Permissão necessária: conta.read
 */
router.get('/', requirePermission('conta.read'), asyncHandler(async (req, res) => {
  await getContaController().index(req, res);
}));

/**
 * GET /api/contas/tipo/:tipo
 * 
 * Busca contas por tipo (BANCO ou CAIXA).
 * 
 * Permissão necessária: conta.read
 */
router.get('/tipo/:tipo', requirePermission('conta.read'), asyncHandler(async (req, res) => {
  await getContaController().findByTipo(req, res);
}));

/**
 * GET /api/contas/:id
 * 
 * Retorna uma conta específica por ID.
 * 
 * Permissão necessária: conta.read
 */
router.get('/:id', requirePermission('conta.read'), asyncHandler(async (req, res) => {
  await getContaController().show(req, res);
}));

/**
 * POST /api/contas
 * 
 * Cria uma nova conta.
 * 
 * Body: CreateContaDto
 * Response: ContaResponseDto
 * Permissão necessária: conta.create
 */
router.post(
  '/',
  requirePermission('conta.create'),
  validateDto(CreateContaDto),
  asyncHandler(async (req, res) => {
    await getContaController().create(req, res);
  })
);

/**
 * PUT /api/contas/:id
 * 
 * Atualiza uma conta existente.
 * 
 * Body: UpdateContaDto
 * Response: ContaResponseDto
 * Permissão necessária: conta.update
 */
router.put(
  '/:id',
  requirePermission('conta.update'),
  validateDtoUpdate(UpdateContaDto),
  asyncHandler(async (req, res) => {
    await getContaController().update(req, res);
  })
);

/**
 * DELETE /api/contas/:id
 * 
 * Remove uma conta.
 * 
 * Permissão necessária: conta.delete
 */
router.delete('/:id', requirePermission('conta.delete'), asyncHandler(async (req, res) => {
  await getContaController().delete(req, res);
}));

export default router;
