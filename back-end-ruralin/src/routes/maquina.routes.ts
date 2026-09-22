import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IMaquinaController } from '../controllers/interfaces/IMaquinaController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateMaquinaDto, UpdateMaquinaDto } from '../application/dto/maquina';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getMaquinaController = (): IMaquinaController => {
  return container.resolve<IMaquinaController>(TYPES.IMaquinaController);
};

/**
 * @swagger
 * /api/maquinas:
 *   get:
 *     tags:
 *       - Máquinas
 *     summary: Lista máquinas
 *     description: Retorna uma lista paginada de máquinas do tenant atual
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
 *         description: Lista de máquinas
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('maquina.read'), asyncHandler(async (req, res) => {
  await getMaquinaController().index(req, res);
}));

/**
 * @swagger
 * /api/maquinas/placa/{placa}:
 *   get:
 *     tags:
 *       - Máquinas
 *     summary: Busca máquina pela placa
 *     description: Retorna uma máquina específica pela placa
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: placa
 *         required: true
 *         schema:
 *           type: string
 *         description: Placa da máquina
 *     responses:
 *       200:
 *         description: Máquina encontrada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Máquina não encontrada
 */
router.get('/placa/:placa', requirePermission('maquina.read'), asyncHandler(async (req, res) => {
  await getMaquinaController().findByPlaca(req, res);
}));

/**
 * @swagger
 * /api/maquinas/placa/{placa}/motorista:
 *   get:
 *     tags:
 *       - Máquinas
 *     summary: Busca o motorista da máquina pela placa
 *     description: Retorna o motorista associado à máquina com a placa informada
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: placa
 *         required: true
 *         schema:
 *           type: string
 *         description: Placa da máquina
 *     responses:
 *       200:
 *         description: Motorista encontrado (ou null se não houver)
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Máquina não encontrada
 */
router.get('/placa/:placa/motorista', requirePermission('maquina.read'), asyncHandler(async (req, res) => {
  await getMaquinaController().getMotoristaByPlaca(req, res);
}));

/**
 * @swagger
 * /api/maquinas/{id}:
 *   get:
 *     tags:
 *       - Máquinas
 *     summary: Busca máquina por ID
 *     description: Retorna uma máquina específica por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da máquina
 *     responses:
 *       200:
 *         description: Máquina encontrada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Máquina não encontrada
 */
router.get('/:id', requirePermission('maquina.read'), asyncHandler(async (req, res) => {
  await getMaquinaController().show(req, res);
}));

/**
 * @swagger
 * /api/maquinas/{id}/depreciacao:
 *   get:
 *     tags:
 *       - Máquinas
 *     summary: Calcula a depreciação da máquina
 *     description: Retorna os valores de depreciação anual e por hora
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da máquina
 *     responses:
 *       200:
 *         description: Cálculo de depreciação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 depreciacaoAnual:
 *                   type: number
 *                 depreciacaoPorHora:
 *                   type: number
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Máquina não encontrada
 */
router.get('/:id/depreciacao', requirePermission('maquina.read'), asyncHandler(async (req, res) => {
  await getMaquinaController().calcularDepreciacao(req, res);
}));

/**
 * @swagger
 * /api/maquinas/{id}/custo:
 *   get:
 *     tags:
 *       - Máquinas
 *     summary: Calcula o custo da máquina por hora
 *     description: Retorna o custo por hora da máquina
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da máquina
 *     responses:
 *       200:
 *         description: Cálculo de custo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 custoHora:
 *                   type: number
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Máquina não encontrada
 */
router.get('/:id/custo', requirePermission('maquina.read'), asyncHandler(async (req, res) => {
  await getMaquinaController().calcularCustoMaquina(req, res);
}));

/**
 * @swagger
 * /api/maquinas:
 *   post:
 *     tags:
 *       - Máquinas
 *     summary: Cria uma nova máquina
 *     description: Cria uma nova máquina no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMaquinaDto'
 *     responses:
 *       201:
 *         description: Máquina criada com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post(
  '/',
  requirePermission('maquina.create'),
  validateDto(CreateMaquinaDto),
  asyncHandler(async (req, res) => {
    await getMaquinaController().create(req, res);
  })
);

/**
 * @swagger
 * /api/maquinas/{id}:
 *   put:
 *     tags:
 *       - Máquinas
 *     summary: Atualiza uma máquina
 *     description: Atualiza uma máquina existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da máquina
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMaquinaDto'
 *     responses:
 *       200:
 *         description: Máquina atualizada com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Máquina não encontrada
 */
router.put(
  '/:id',
  requirePermission('maquina.update'),
  validateDtoUpdate(UpdateMaquinaDto),
  asyncHandler(async (req, res) => {
    await getMaquinaController().update(req, res);
  })
);

/**
 * @swagger
 * /api/maquinas/{id}/horimetro:
 *   patch:
 *     tags:
 *       - Máquinas
 *     summary: Atualiza horímetro da máquina
 *     description: Atualiza um campo de horímetro (horimetroAbastecimento, horimetroManutencao, horimetroApontamento). Só aceita valor maior que o atual.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da máquina
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campo
 *               - valor
 *             properties:
 *               campo:
 *                 type: string
 *                 enum: [horimetroAbastecimento, horimetroManutencao, horimetroApontamento]
 *               valor:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Horímetro atualizado com sucesso
 *       400:
 *         description: Erro de validação ou valor menor que o atual
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Máquina não encontrada
 */
router.patch(
  '/:id/horimetro',
  requirePermission('maquina.update'),
  asyncHandler(async (req, res) => {
    await getMaquinaController().atualizarHorimetro(req, res);
  })
);

/**
 * @swagger
 * /api/maquinas/{id}:
 *   delete:
 *     tags:
 *       - Máquinas
 *     summary: Remove uma máquina
 *     description: Remove uma máquina do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da máquina
 *     responses:
 *       204:
 *         description: Máquina removida com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Máquina não encontrada
 */
router.delete('/:id', requirePermission('maquina.delete'), asyncHandler(async (req, res) => {
  await getMaquinaController().delete(req, res);
}));

export default router;
