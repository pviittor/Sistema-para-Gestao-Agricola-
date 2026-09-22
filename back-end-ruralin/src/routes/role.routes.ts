import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IRoleController } from '../controllers/interfaces/IRoleController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateRoleDto, UpdateRoleDto } from '../application/dto/role';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getRoleController = (): IRoleController => {
  return container.resolve<IRoleController>(TYPES.IRoleController);
};

/**
 * GET /api/roles
 * 
 * Lista todas as roles.
 * 
 * Permissão necessária: role.read
 */
router.get('/', requirePermission('role.read'), asyncHandler(async (req, res) => {
  await getRoleController().index(req, res);
}));

/**
 * GET /api/roles/:id
 * 
 * Retorna uma role específica por ID.
 * 
 * Permissão necessária: role.read
 */
router.get('/:id', requirePermission('role.read'), asyncHandler(async (req, res) => {
  await getRoleController().show(req, res);
}));

/**
 * POST /api/roles
 * 
 * Cria uma nova role.
 * 
 * Body: CreateRoleDto
 * Response: RoleResponseDto
 * Permissão necessária: role.create
 */
router.post(
  '/',
  requirePermission('role.create'),
  validateDto(CreateRoleDto),
  asyncHandler(async (req, res) => {
    await getRoleController().create(req, res);
  })
);

/**
 * PUT /api/roles/:id
 * 
 * Atualiza uma role existente.
 * 
 * Body: UpdateRoleDto
 * Response: RoleResponseDto
 * Permissão necessária: role.update
 */
router.put(
  '/:id',
  requirePermission('role.update'),
  validateDtoUpdate(UpdateRoleDto),
  asyncHandler(async (req, res) => {
    await getRoleController().update(req, res);
  })
);

/**
 * DELETE /api/roles/:id
 * 
 * Remove uma role.
 * 
 * Permissão necessária: role.delete
 */
router.delete('/:id', requirePermission('role.delete'), asyncHandler(async (req, res) => {
  await getRoleController().delete(req, res);
}));

export default router;
