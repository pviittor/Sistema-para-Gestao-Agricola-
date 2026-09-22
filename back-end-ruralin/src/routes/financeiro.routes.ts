import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IFinanceiroController } from '../controllers/interfaces/IFinanceiroController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateFinanceiroDto, UpdateFinanceiroDto } from '../application/dto/financeiro';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission, requireRole } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getFinanceiroController = (): IFinanceiroController => {
  return container.resolve<IFinanceiroController>(TYPES.IFinanceiroController);
};

/**
 * GET /api/financeiros
 * 
 * Lista todos os registros financeiros do usuário autenticado.
 * 
 * Permissão necessária: financeiro.read
 */
router.get('/', requireRole('Financeiro'), asyncHandler(async (req, res) => {
  await getFinanceiroController().index(req, res);
}));

/**
 * GET /api/financeiros/:id
 * 
 * Retorna um registro financeiro específico por ID.
 * 
 * Permissão necessária: financeiro.read
 */
router.get('/:id', requirePermission('financeiro.read'), asyncHandler(async (req, res) => {
  await getFinanceiroController().show(req, res);
}));

/**
 * POST /api/financeiros
 * 
 * Cria um novo registro financeiro.
 * 
 * Body: CreateFinanceiroDto
 * Response: FinanceiroResponseDto
 * Permissão necessária: financeiro.create
 */
router.post(
  '/',
  requirePermission('financeiro.create'),
  validateDto(CreateFinanceiroDto),
  asyncHandler(async (req, res) => {
    await getFinanceiroController().create(req, res);
  })
);

/**
 * PUT /api/financeiros/:id
 * 
 * Atualiza um registro financeiro existente.
 * 
 * Body: UpdateFinanceiroDto
 * Response: FinanceiroResponseDto
 * Permissão necessária: financeiro.update
 */
router.put(
  '/:id',
  requirePermission('financeiro.update'),
  validateDtoUpdate(UpdateFinanceiroDto),
  asyncHandler(async (req, res) => {
    await getFinanceiroController().update(req, res);
  })
);

/**
 * DELETE /api/financeiros/:id
 * 
 * Remove um registro financeiro.
 * 
 * Permissão necessária: financeiro.delete
 */
router.delete('/:id', requirePermission('financeiro.delete'), asyncHandler(async (req, res) => {
  await getFinanceiroController().delete(req, res);
}));

export default router;
