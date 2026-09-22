import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IPlanoContaGerencialController } from '../controllers/interfaces/IPlanoContaGerencialController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreatePlanoContaGerencialDto, UpdatePlanoContaGerencialDto } from '../application/dto/planoContaGerencial';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

const getPlanoContaGerencialController = (): IPlanoContaGerencialController => {
  return container.resolve<IPlanoContaGerencialController>(TYPES.IPlanoContaGerencialController);
};

/**
 * @swagger
 * /api/planoContasGerenciais:
 *   get:
 *     tags:
 *       - Plano de Contas Gerencial
 *     summary: Lista contas do plano de contas gerencial
 *     description: Retorna uma lista paginada de contas do plano de contas gerencial do tenant atual
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
 *         description: Lista de contas
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
 *                         $ref: '#/components/schemas/PlanoContaGerencialResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *   post:
 *     tags:
 *       - Plano de Contas Gerencial
 *     summary: Cria uma nova conta
 *     description: Cria uma nova conta no plano de contas gerencial do tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePlanoContaGerencialDto'
 *           examples:
 *             create:
 *               summary: Criar conta sintética de primeiro nível
 *               value:
 *                 item: "1.0.0.0"
 *                 descricao: "Receita"
 *                 tipo: "SINTETICA"
 *                 nivel: 1
 *             createFilha:
 *               summary: Criar conta filha
 *               value:
 *                 item: "1.1.0.0"
 *                 descricao: "Receita de Vendas"
 *                 tipo: "SINTETICA"
 *                 contaPaiId: 1
 *                 nivel: 2
 *             createAnalitica:
 *               summary: Criar conta analítica
 *               value:
 *                 item: "1.1.1.0"
 *                 descricao: "Vendas Atacado"
 *                 tipo: "ANALITICA"
 *                 contaPaiId: 2
 *                 nivel: 3
 *     responses:
 *       201:
 *         description: Conta criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanoContaGerencialResponseDto'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão ou conta pai não pertence ao tenant
 */
router.get('/', requirePermission('planoContaGerencial.read'), asyncHandler(async (req, res) => {
  await getPlanoContaGerencialController().index(req, res);
}));

router.post(
  '/',
  requirePermission('planoContaGerencial.create'),
  validateDto(CreatePlanoContaGerencialDto),
  asyncHandler(async (req, res) => {
    await getPlanoContaGerencialController().create(req, res);
  })
);

/**
 * @swagger
 * /api/planoContasGerenciais/tipoFluxo/{tipoFluxo}:
 *   get:
 *     tags:
 *       - Plano de Contas Gerencial
 *     summary: Busca contas por tipo de fluxo financeiro
 *     description: Retorna contas filtradas por tipo de fluxo (RECEITA ou DESPESA). Útil para popular dropdowns de lançamentos.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipoFluxo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [RECEITA, DESPESA]
 *         description: Tipo de fluxo financeiro
 *       - in: query
 *         name: apenasAnaliticas
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Se true, retorna somente contas ANALITICAS (aptas para lançamentos)
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Se false, inclui contas inativas
 *     responses:
 *       200:
 *         description: Lista de contas do tipo de fluxo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlanoContaGerencialResponseDto'
 *       400:
 *         description: Tipo de fluxo inválido
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/tipoFluxo/:tipoFluxo', requirePermission('planoContaGerencial.read'), asyncHandler(async (req, res) => {
  await getPlanoContaGerencialController().findByTipoFluxo(req, res);
}));

/**
 * @swagger
 * /api/planoContasGerenciais/{id}:
 *   get:
 *     tags:
 *       - Plano de Contas Gerencial
 *     summary: Busca uma conta por ID
 *     description: Retorna uma conta específica do plano de contas gerencial
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da conta
 *     responses:
 *       200:
 *         description: Conta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanoContaGerencialResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Conta não encontrada
 *   put:
 *     tags:
 *       - Plano de Contas Gerencial
 *     summary: Atualiza uma conta
 *     description: Atualiza uma conta existente do plano de contas gerencial
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da conta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePlanoContaGerencialDto'
 *     responses:
 *       200:
 *         description: Conta atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanoContaGerencialResponseDto'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Conta não encontrada
 *   delete:
 *     tags:
 *       - Plano de Contas Gerencial
 *     summary: Deleta uma conta
 *     description: Deleta uma conta do plano de contas gerencial (apenas se não possuir filhos)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da conta
 *     responses:
 *       204:
 *         description: Conta deletada com sucesso
 *       400:
 *         description: Conta possui filhos e não pode ser deletada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Conta não encontrada
 */
router.get('/:id', requirePermission('planoContaGerencial.read'), asyncHandler(async (req, res) => {
  await getPlanoContaGerencialController().show(req, res);
}));

router.put(
  '/:id',
  requirePermission('planoContaGerencial.update'),
  validateDtoUpdate(UpdatePlanoContaGerencialDto),
  asyncHandler(async (req, res) => {
    await getPlanoContaGerencialController().update(req, res);
  })
);

router.delete('/:id', requirePermission('planoContaGerencial.delete'), asyncHandler(async (req, res) => {
  await getPlanoContaGerencialController().delete(req, res);
}));

/**
 * @swagger
 * /api/planoContasGerenciais/nivel/{nivel}:
 *   get:
 *     tags:
 *       - Plano de Contas Gerencial
 *     summary: Busca contas por nível
 *     description: Retorna todas as contas de um nível específico (1 a 4)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nivel
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *         description: Nível hierárquico (1 a 4)
 *     responses:
 *       200:
 *         description: Lista de contas do nível
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlanoContaGerencialResponseDto'
 *       400:
 *         description: Nível inválido
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/nivel/:nivel', requirePermission('planoContaGerencial.read'), asyncHandler(async (req, res) => {
  await getPlanoContaGerencialController().findByNivel(req, res);
}));

/**
 * @swagger
 * /api/planoContasGerenciais/tipo/{tipo}:
 *   get:
 *     tags:
 *       - Plano de Contas Gerencial
 *     summary: Busca contas por tipo
 *     description: Retorna todas as contas de um tipo específico (SINTETICA ou ANALITICA)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [SINTETICA, ANALITICA]
 *         description: Tipo da conta
 *     responses:
 *       200:
 *         description: Lista de contas do tipo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlanoContaGerencialResponseDto'
 *       400:
 *         description: Tipo inválido
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/tipo/:tipo', requirePermission('planoContaGerencial.read'), asyncHandler(async (req, res) => {
  await getPlanoContaGerencialController().findByTipo(req, res);
}));

/**
 * @swagger
 * /api/planoContasGerenciais/contaPai/{contaPaiId}:
 *   get:
 *     tags:
 *       - Plano de Contas Gerencial
 *     summary: Busca contas filhas
 *     description: Retorna todas as contas filhas de uma conta pai específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contaPaiId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da conta pai
 *     responses:
 *       200:
 *         description: Lista de contas filhas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlanoContaGerencialResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Conta pai não encontrada
 */
router.get('/contaPai/:contaPaiId', requirePermission('planoContaGerencial.read'), asyncHandler(async (req, res) => {
  await getPlanoContaGerencialController().findByContaPai(req, res);
}));

/**
 * @swagger
 * /api/planoContasGerenciais/{id}/arvore:
 *   get:
 *     tags:
 *       - Plano de Contas Gerencial
 *     summary: Busca árvore completa de contas
 *     description: Retorna a árvore completa de contas a partir de uma conta raiz, incluindo todos os níveis hierárquicos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da conta raiz
 *     responses:
 *       200:
 *         description: Árvore de contas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanoContaGerencialResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Conta não encontrada
 */
router.get('/:id/arvore', requirePermission('planoContaGerencial.read'), asyncHandler(async (req, res) => {
  await getPlanoContaGerencialController().findArvore(req, res);
}));

export default router;
