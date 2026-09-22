import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IServicoAgricolaController } from '../controllers/interfaces/IServicoAgricolaController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateServicoAgricolaDto, UpdateServicoAgricolaDto } from '../application/dto/servicoAgricola';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

const getServicoAgricolaController = (): IServicoAgricolaController => {
  return container.resolve<IServicoAgricolaController>(TYPES.IServicoAgricolaController);
};

/**
 * @swagger
 * /api/servicosAgricola:
 *   get:
 *     tags:
 *       - Serviços Agrícolas
 *     summary: Lista serviços agrícolas
 *     description: Retorna uma lista paginada de serviços agrícolas do tenant atual
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de serviços agrícolas
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
 *                         $ref: '#/components/schemas/ServicoAgricolaResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *   post:
 *     tags:
 *       - Serviços Agrícolas
 *     summary: Cria um novo serviço agrícola
 *     description: Cria um novo serviço agrícola no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateServicoAgricolaDto'
 *           examples:
 *             create:
 *               summary: Criar serviço agrícola
 *               value:
 *                 descricao_srv: Aplicação de Defensivo
 *                 financeiro_srv: true
 *                 observacao_srv: Serviço que gera movimento financeiro
 *     responses:
 *       201:
 *         description: Serviço agrícola criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServicoAgricolaResponseDto'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('servicoAgricola.read'), asyncHandler(async (req, res) => {
  await getServicoAgricolaController().index(req, res);
}));

/**
 * @swagger
 * /api/servicosAgricola/{id}:
 *   get:
 *     tags:
 *       - Serviços Agrícolas
 *     summary: Busca serviço agrícola por ID
 *     description: Retorna um serviço agrícola específico por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do serviço agrícola (id_srv)
 *     responses:
 *       200:
 *         description: Serviço agrícola encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServicoAgricolaResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Serviço agrícola não encontrado
 *   put:
 *     tags:
 *       - Serviços Agrícolas
 *     summary: Atualiza um serviço agrícola
 *     description: Atualiza um serviço agrícola existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateServicoAgricolaDto'
 *     responses:
 *       200:
 *         description: Serviço agrícola atualizado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Serviço agrícola não encontrado
 *   delete:
 *     tags:
 *       - Serviços Agrícolas
 *     summary: Remove um serviço agrícola
 *     description: Remove um serviço agrícola do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Serviço agrícola removido com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Serviço agrícola não encontrado
 */
router.get('/:id', requirePermission('servicoAgricola.read'), asyncHandler(async (req, res) => {
  await getServicoAgricolaController().show(req, res);
}));

router.post(
  '/',
  requirePermission('servicoAgricola.create'),
  validateDto(CreateServicoAgricolaDto),
  asyncHandler(async (req, res) => {
    await getServicoAgricolaController().create(req, res);
  })
);

router.put(
  '/:id',
  requirePermission('servicoAgricola.update'),
  validateDtoUpdate(UpdateServicoAgricolaDto),
  asyncHandler(async (req, res) => {
    await getServicoAgricolaController().update(req, res);
  })
);

router.delete('/:id', requirePermission('servicoAgricola.delete'), asyncHandler(async (req, res) => {
  await getServicoAgricolaController().delete(req, res);
}));

export default router;
