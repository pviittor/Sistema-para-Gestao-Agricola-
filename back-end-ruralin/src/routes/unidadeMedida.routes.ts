import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IUnidadeMedidaController } from '../controllers/interfaces/IUnidadeMedidaController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateUnidadeMedidaDto, UpdateUnidadeMedidaDto } from '../application/dto/unidadeMedida';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getUnidadeMedidaController = (): IUnidadeMedidaController => {
  return container.resolve<IUnidadeMedidaController>(TYPES.IUnidadeMedidaController);
};

/**
 * @swagger
 * /api/unidadesMedida:
 *   get:
 *     tags:
 *       - Unidades de Medida
 *     summary: Lista unidades de medida
 *     description: Retorna uma lista paginada de unidades de medida do tenant atual
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
 *         description: Lista de unidades de medida
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
 *                         $ref: '#/components/schemas/UnidadeMedidaResponseDto'
 *             examples:
 *               success:
 *                 summary: Lista paginada de unidades de medida
 *                 value:
 *                   data:
 *                     - id_unidade: 1
 *                       tenantId: 1
 *                       descricao_unidade: Quilograma
 *                       abreviatura_unidade: kg
 *                       usercreation: 1
 *                       datecreation: '2026-01-16T12:00:00.000Z'
 *                   page: 1
 *                   limit: 10
 *                   total: 1
 *                   totalPages: 1
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sem permissão
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     tags:
 *       - Unidades de Medida
 *     summary: Cria uma nova unidade de medida
 *     description: Cria uma nova unidade de medida no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUnidadeMedidaDto'
 *           examples:
 *             create:
 *               summary: Criar unidade de medida
 *               value:
 *                 descricao_unidade: Quilograma
 *                 abreviatura_unidade: kg
 *             create2:
 *               summary: Criar unidade de medida (litro)
 *               value:
 *                 descricao_unidade: Litro
 *                 abreviatura_unidade: L
 *     responses:
 *       201:
 *         description: Unidade de medida criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnidadeMedidaResponseDto'
 *             examples:
 *               created:
 *                 summary: Unidade criada
 *                 value:
 *                   id_unidade: 1
 *                   tenantId: 1
 *                   descricao_unidade: Quilograma
 *                   abreviatura_unidade: kg
 *                   usercreation: 1
 *                   datecreation: '2026-01-16T12:00:00.000Z'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               validation:
 *                 summary: Erro de validação
 *                 value:
 *                   success: false
 *                   error:
 *                     code: VALIDATION_ERROR
 *                     message: Descrição deve ter no mínimo 3 caracteres
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('unidadeMedida.read'), asyncHandler(async (req, res) => {
  await getUnidadeMedidaController().index(req, res);
}));

/**
 * @swagger
 * /api/unidadesMedida/{id}:
 *   get:
 *     tags:
 *       - Unidades de Medida
 *     summary: Busca unidade de medida por ID
 *     description: Retorna uma unidade de medida específica por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da unidade de medida (id_unidade)
 *     responses:
 *       200:
 *         description: Unidade de medida encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnidadeMedidaResponseDto'
 *             examples:
 *               success:
 *                 summary: Unidade encontrada
 *                 value:
 *                   id_unidade: 1
 *                   tenantId: 1
 *                   descricao_unidade: Quilograma
 *                   abreviatura_unidade: kg
 *                   usercreation: 1
 *                   datecreation: '2026-01-16T12:00:00.000Z'
 *                   usuarioCriador:
 *                     id: 1
 *                     nome: João Silva
 *                     email: joao@example.com
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Unidade de medida não encontrada
 *   put:
 *     tags:
 *       - Unidades de Medida
 *     summary: Atualiza uma unidade de medida
 *     description: Atualiza uma unidade de medida existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da unidade de medida (id_unidade)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUnidadeMedidaDto'
 *           examples:
 *             update:
 *               summary: Atualizar unidade de medida
 *               value:
 *                 descricao_unidade: Quilograma Atualizado
 *                 abreviatura_unidade: KG
 *     responses:
 *       200:
 *         description: Unidade de medida atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnidadeMedidaResponseDto'
 *             examples:
 *               updated:
 *                 summary: Unidade atualizada
 *                 value:
 *                   id_unidade: 1
 *                   tenantId: 1
 *                   descricao_unidade: Quilograma Atualizado
 *                   abreviatura_unidade: KG
 *                   usercreation: 1
 *                   datecreation: '2026-01-16T12:00:00.000Z'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Unidade de medida não encontrada
 *   delete:
 *     tags:
 *       - Unidades de Medida
 *     summary: Remove uma unidade de medida
 *     description: Remove uma unidade de medida do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da unidade de medida (id_unidade)
 *     responses:
 *       204:
 *         description: Unidade de medida removida com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Unidade de medida não encontrada
 */
router.get('/:id', requirePermission('unidadeMedida.read'), asyncHandler(async (req, res) => {
  await getUnidadeMedidaController().show(req, res);
}));

router.post(
  '/',
  requirePermission('unidadeMedida.create'),
  validateDto(CreateUnidadeMedidaDto),
  asyncHandler(async (req, res) => {
    await getUnidadeMedidaController().create(req, res);
  })
);

router.put(
  '/:id',
  requirePermission('unidadeMedida.update'),
  validateDtoUpdate(UpdateUnidadeMedidaDto),
  asyncHandler(async (req, res) => {
    await getUnidadeMedidaController().update(req, res);
  })
);

router.delete('/:id', requirePermission('unidadeMedida.delete'), asyncHandler(async (req, res) => {
  await getUnidadeMedidaController().delete(req, res);
}));

export default router;
