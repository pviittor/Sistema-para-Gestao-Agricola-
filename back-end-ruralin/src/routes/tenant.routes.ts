import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { ITenantController } from '../controllers/interfaces/ITenantController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateTenantDto, UpdateTenantDto } from '../application/dto/tenant';
import { asyncHandler } from '../middleware/errorHandler';
import { requireRole } from '../middleware/authorization';
import { consultoriaAccessMiddleware } from '../middleware/consultoriaAccess';

const router = Router();

// Helper para resolver controller de forma lazy
const getTenantController = (): ITenantController => {
  return container.resolve<ITenantController>(TYPES.ITenantController);
};

/**
 * @swagger
 * /api/tenants:
 *   get:
 *     tags:
 *       - Tenants
 *     summary: Lista tenants
 *     description: Retorna uma lista paginada de tenants (CONSULTOR vê apenas seus tenants, GOD vê todos)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de registros por página
 *     responses:
 *       200:
 *         description: Lista de tenants
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResult'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TenantResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *   post:
 *     tags:
 *       - Tenants
 *     summary: Cria um novo tenant
 *     description: Cria um novo tenant na consultoria do CONSULTOR (apenas CONSULTOR ou GOD)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTenantDto'
 *           examples:
 *             exemplo:
 *               summary: Criar tenant
 *               value:
 *                 nome: Meu Tenant
 *                 slug: meu-tenant
 *                 limiteUsuarios: 100
 *     responses:
 *       201:
 *         description: Tenant criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenantResponseDto'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas CONSULTOR ou GOD podem criar tenants
 */
router.get('/', requireRole(['GOD', 'CONSULTOR']), asyncHandler(async (req, res) => {
  await getTenantController().index(req, res);
}));

router.post(
  '/',
  requireRole(['GOD', 'CONSULTOR']),
  validateDto(CreateTenantDto),
  asyncHandler(async (req, res) => {
    await getTenantController().create(req, res);
  })
);

/**
 * @swagger
 * /api/tenants/{id}:
 *   get:
 *     tags:
 *       - Tenants
 *     summary: Obtém tenant por ID
 *     description: Retorna um tenant específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do tenant
 *     responses:
 *       200:
 *         description: Tenant encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenantResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão para acessar este tenant
 *       404:
 *         description: Tenant não encontrado
 *   put:
 *     tags:
 *       - Tenants
 *     summary: Atualiza tenant
 *     description: Atualiza um tenant existente (apenas CONSULTOR da consultoria ou GOD)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do tenant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTenantDto'
 *     responses:
 *       200:
 *         description: Tenant atualizado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Tenant não encontrado
 *   delete:
 *     tags:
 *       - Tenants
 *     summary: Remove um tenant
 *     description: Remove um tenant do sistema (soft delete - desativa) (apenas CONSULTOR da consultoria ou GOD)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do tenant
 *     responses:
 *       204:
 *         description: Tenant removido com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Tenant não encontrado
 */
router.get('/:id', requireRole(['GOD', 'CONSULTOR', 'ROOT', 'CLIENT']), consultoriaAccessMiddleware, asyncHandler(async (req, res) => {
  await getTenantController().show(req, res);
}));

router.put(
  '/:id',
  requireRole(['GOD', 'CONSULTOR']),
  consultoriaAccessMiddleware,
  validateDtoUpdate(UpdateTenantDto),
  asyncHandler(async (req, res) => {
    await getTenantController().update(req, res);
  })
);

router.delete('/:id', requireRole(['GOD', 'CONSULTOR']), consultoriaAccessMiddleware, asyncHandler(async (req, res) => {
  await getTenantController().delete(req, res);
}));

/**
 * @swagger
 * /api/tenants/{id}/desativar:
 *   put:
 *     tags:
 *       - Tenants
 *     summary: Desativa um tenant
 *     description: Desativa um tenant (apenas CONSULTOR da consultoria ou GOD)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do tenant
 *     responses:
 *       200:
 *         description: Tenant desativado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Tenant desativado com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/TenantResponseDto'
 *       400:
 *         description: Tenant já está desativado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Tenant não encontrado
 */
router.put('/:id/desativar', requireRole(['GOD', 'CONSULTOR']), consultoriaAccessMiddleware, asyncHandler(async (req, res) => {
  await getTenantController().desativar(req, res);
}));

/**
 * @swagger
 * /api/tenants/{id}/ativar:
 *   put:
 *     tags:
 *       - Tenants
 *     summary: Ativa um tenant
 *     description: Ativa um tenant previamente desativado (apenas CONSULTOR da consultoria ou GOD)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do tenant
 *     responses:
 *       200:
 *         description: Tenant ativado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Tenant ativado com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/TenantResponseDto'
 *       400:
 *         description: Tenant já está ativo ou consultoria está inativa
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Tenant não encontrado
 */
router.put('/:id/ativar', requireRole(['GOD', 'CONSULTOR']), consultoriaAccessMiddleware, asyncHandler(async (req, res) => {
  await getTenantController().ativar(req, res);
}));

/**
 * @swagger
 * /api/tenants/{id}/status:
 *   get:
 *     tags:
 *       - Tenants
 *     summary: Obtém status de um tenant
 *     description: Retorna informações de status (ativo/inativo) de um tenant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do tenant
 *     responses:
 *       200:
 *         description: Status do tenant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     ativo:
 *                       type: boolean
 *                       example: true
 *                     dataAtivacao:
 *                       type: string
 *                       format: date-time
 *                       example: '2026-01-17T10:00:00Z'
 *                     dataDesativacao:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Tenant não encontrado
 */
router.get('/:id/status', requireRole(['GOD', 'CONSULTOR', 'ROOT', 'CLIENT']), consultoriaAccessMiddleware, asyncHandler(async (req, res) => {
  await getTenantController().getStatus(req, res);
}));

export default router;
