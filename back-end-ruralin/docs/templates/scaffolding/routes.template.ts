/**
 * TEMPLATE: Routes
 * 
 * Variáveis de substituição:
 * - {{EntityName}}: Nome da entidade em PascalCase
 * - {{entityName}}: Nome da entidade em camelCase
 * - {{permissions}}: Permissões (geradas a partir da especificação)
 */

import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { I{{EntityName}}Controller } from '../controllers/interfaces/I{{EntityName}}Controller';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { Create{{EntityName}}Dto, Update{{EntityName}}Dto } from '../application/dto/{{entityName}}';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const get{{EntityName}}Controller = (): I{{EntityName}}Controller => {
  return container.resolve<I{{EntityName}}Controller>(TYPES.I{{EntityName}}Controller);
};

/**
 * GET /api/{{entityName}}s
 * 
 * Lista todas as {{entityName}}s do tenant atual.
 * 
 * Permissão necessária: {{permissions.read}}
 */
router.get('/', requirePermission('{{permissions.read}}'), asyncHandler(async (req, res) => {
  await get{{EntityName}}Controller().index(req, res);
}));

/**
 * GET /api/{{entityName}}s/:id
 * 
 * Retorna uma {{entityName}} específica por ID.
 * 
 * Permissão necessária: {{permissions.read}}
 */
router.get('/:id', requirePermission('{{permissions.read}}'), asyncHandler(async (req, res) => {
  await get{{EntityName}}Controller().show(req, res);
}));

/**
 * POST /api/{{entityName}}s
 * 
 * Cria uma nova {{entityName}}.
 * 
 * Body: Create{{EntityName}}Dto
 * Response: {{EntityName}}ResponseDto
 * Permissão necessária: {{permissions.create}}
 */
router.post(
  '/',
  requirePermission('{{permissions.create}}'),
  validateDto(Create{{EntityName}}Dto),
  asyncHandler(async (req, res) => {
    await get{{EntityName}}Controller().create(req, res);
  })
);

/**
 * PUT /api/{{entityName}}s/:id
 * 
 * Atualiza uma {{entityName}} existente.
 * 
 * Body: Update{{EntityName}}Dto
 * Response: {{EntityName}}ResponseDto
 * Permissão necessária: {{permissions.update}}
 */
router.put(
  '/:id',
  requirePermission('{{permissions.update}}'),
  validateDtoUpdate(Update{{EntityName}}Dto),
  asyncHandler(async (req, res) => {
    await get{{EntityName}}Controller().update(req, res);
  })
);

/**
 * DELETE /api/{{entityName}}s/:id
 * 
 * Remove uma {{entityName}}.
 * 
 * Permissão necessária: {{permissions.delete}}
 */
router.delete('/:id', requirePermission('{{permissions.delete}}'), asyncHandler(async (req, res) => {
  await get{{EntityName}}Controller().delete(req, res);
}));

export default router;
