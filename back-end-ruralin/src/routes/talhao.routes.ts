import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { ITalhaoController } from '../controllers/interfaces/ITalhaoController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateTalhaoDto, UpdateTalhaoDto } from '../application/dto/talhao';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getTalhaoController = (): ITalhaoController => {
  return container.resolve<ITalhaoController>(TYPES.ITalhaoController);
};

/**
 * @swagger
 * /api/talhoes:
 *   get:
 *     tags:
 *       - Talhões
 *     summary: Lista talhões
 *     description: Retorna uma lista paginada de talhões do tenant atual
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
 *         description: Lista de talhões
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('talhao.read'), asyncHandler(async (req, res) => {
  await getTalhaoController().index(req, res);
}));

// GET /all — Lista todos sem paginação (para selects/combos)
router.get('/all', requirePermission('talhao.read'), asyncHandler(async (req, res) => {
  await getTalhaoController().listAll(req, res);
}));

/**
 * @swagger
 * /api/talhoes/fazenda/{fazendaId}:
 *   get:
 *     tags:
 *       - Talhões
 *     summary: Lista talhões por fazenda
 *     description: Retorna todos os talhões de uma fazenda com culturas associadas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fazendaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da fazenda
 *     responses:
 *       200:
 *         description: Lista de talhões da fazenda
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/fazenda/:fazendaId', requirePermission('talhao.read'), asyncHandler(async (req, res) => {
  await getTalhaoController().findByFazenda(req, res);
}));

/**
 * @swagger
 * /api/talhoes/{id}/ndvi:
 *   get:
 *     tags:
 *       - Talhões
 *     summary: Busca dados NDVI/satélite do talhão
 *     description: Retorna imagens de satélite e dados NDVI para o talhão
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do talhão
 *       - in: query
 *         name: start
 *         schema:
 *           type: integer
 *         description: Data inicial (Unix timestamp)
 *       - in: query
 *         name: end
 *         schema:
 *           type: integer
 *         description: Data final (Unix timestamp)
 *     responses:
 *       200:
 *         description: Dados NDVI do talhão
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Talhão não encontrado
 */
router.get('/:id/ndvi', requirePermission('talhao.read'), asyncHandler(async (req, res) => {
  await getTalhaoController().getNdvi(req, res);
}));

/**
 * @swagger
 * /api/talhoes/{id}:
 *   get:
 *     tags:
 *       - Talhões
 *     summary: Busca talhão por ID
 *     description: Retorna um talhão específico por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do talhão
 *     responses:
 *       200:
 *         description: Talhão encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Talhão não encontrado
 */
router.get('/:id', requirePermission('talhao.read'), asyncHandler(async (req, res) => {
  await getTalhaoController().show(req, res);
}));

/**
 * @swagger
 * /api/talhoes:
 *   post:
 *     tags:
 *       - Talhões
 *     summary: Cria um novo talhão
 *     description: Cria um novo talhão no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTalhaoDto'
 *     responses:
 *       201:
 *         description: Talhão criado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post(
  '/',
  requirePermission('talhao.create'),
  validateDto(CreateTalhaoDto),
  asyncHandler(async (req, res) => {
    await getTalhaoController().create(req, res);
  })
);

/**
 * @swagger
 * /api/talhoes/{id}:
 *   put:
 *     tags:
 *       - Talhões
 *     summary: Atualiza um talhão
 *     description: Atualiza um talhão existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do talhão
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTalhaoDto'
 *     responses:
 *       200:
 *         description: Talhão atualizado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Talhão não encontrado
 */
router.put(
  '/:id',
  requirePermission('talhao.update'),
  validateDtoUpdate(UpdateTalhaoDto),
  asyncHandler(async (req, res) => {
    await getTalhaoController().update(req, res);
  })
);

/**
 * @swagger
 * /api/talhoes/{id}:
 *   delete:
 *     tags:
 *       - Talhões
 *     summary: Remove um talhão
 *     description: Remove um talhão do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do talhão
 *     responses:
 *       204:
 *         description: Talhão removido com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Talhão não encontrado
 */
router.delete('/:id', requirePermission('talhao.delete'), asyncHandler(async (req, res) => {
  await getTalhaoController().delete(req, res);
}));

export default router;
