import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IAbastecimentoController } from '../controllers/interfaces/IAbastecimentoController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateAbastecimentoDto, UpdateAbastecimentoDto } from '../application/dto/abastecimento';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getAbastecimentoController = (): IAbastecimentoController => {
  return container.resolve<IAbastecimentoController>(TYPES.IAbastecimentoController);
};

/**
 * @swagger
 * /api/abastecimentos:
 *   get:
 *     tags:
 *       - Abastecimentos
 *     summary: Lista abastecimentos
 *     description: Retorna uma lista paginada de abastecimentos do tenant atual
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
 *         description: Lista de abastecimentos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('abastecimento.read'), asyncHandler(async (req, res) => {
  await getAbastecimentoController().index(req, res);
}));

/**
 * @swagger
 * /api/abastecimentos/maquina/{idMaquina}:
 *   get:
 *     tags:
 *       - Abastecimentos
 *     summary: Busca abastecimentos por máquina
 *     description: Retorna todos os abastecimentos de uma máquina específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idMaquina
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da máquina
 *     responses:
 *       200:
 *         description: Lista de abastecimentos da máquina
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/maquina/:idMaquina', requirePermission('abastecimento.read'), asyncHandler(async (req, res) => {
  await getAbastecimentoController().findByMaquina(req, res);
}));

/**
 * @swagger
 * /api/abastecimentos/periodo:
 *   get:
 *     tags:
 *       - Abastecimentos
 *     summary: Busca abastecimentos por período
 *     description: Retorna todos os abastecimentos em um período especificado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de abastecimentos no período
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/periodo', requirePermission('abastecimento.read'), asyncHandler(async (req, res) => {
  await getAbastecimentoController().findByPeriodo(req, res);
}));

/**
 * @swagger
 * /api/abastecimentos/{id}:
 *   get:
 *     tags:
 *       - Abastecimentos
 *     summary: Busca abastecimento por ID
 *     description: Retorna um abastecimento específico por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do abastecimento
 *     responses:
 *       200:
 *         description: Abastecimento encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Abastecimento não encontrado
 */
router.get('/:id', requirePermission('abastecimento.read'), asyncHandler(async (req, res) => {
  await getAbastecimentoController().show(req, res);
}));

/**
 * @swagger
 * /api/abastecimentos:
 *   post:
 *     tags:
 *       - Abastecimentos
 *     summary: Cria um novo abastecimento
 *     description: Cria um novo abastecimento no tenant atual. O total é calculado automaticamente (volume × preço) se não informado.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAbastecimentoDto'
 *     responses:
 *       201:
 *         description: Abastecimento criado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post(
  '/',
  requirePermission('abastecimento.create'),
  validateDto(CreateAbastecimentoDto),
  asyncHandler(async (req, res) => {
    await getAbastecimentoController().create(req, res);
  })
);

/**
 * @swagger
 * /api/abastecimentos/{id}:
 *   put:
 *     tags:
 *       - Abastecimentos
 *     summary: Atualiza um abastecimento
 *     description: Atualiza um abastecimento existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do abastecimento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAbastecimentoDto'
 *     responses:
 *       200:
 *         description: Abastecimento atualizado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Abastecimento não encontrado
 */
router.put(
  '/:id',
  requirePermission('abastecimento.update'),
  validateDtoUpdate(UpdateAbastecimentoDto),
  asyncHandler(async (req, res) => {
    await getAbastecimentoController().update(req, res);
  })
);

/**
 * @swagger
 * /api/abastecimentos/{id}:
 *   delete:
 *     tags:
 *       - Abastecimentos
 *     summary: Remove um abastecimento
 *     description: Remove um abastecimento do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do abastecimento
 *     responses:
 *       204:
 *         description: Abastecimento removido com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Abastecimento não encontrado
 */
router.delete('/:id', requirePermission('abastecimento.delete'), asyncHandler(async (req, res) => {
  await getAbastecimentoController().delete(req, res);
}));

export default router;
