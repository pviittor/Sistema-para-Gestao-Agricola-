import { Router } from 'express';
import { container } from '../core/di';
import { IRegistroArmazenagemController } from '../controllers/interfaces/IRegistroArmazenagemController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateRegistroArmazenagemDto, UpdateRegistroArmazenagemDto } from '../application/dto/registroArmazenagem';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

const getRegistroArmazenagemController = (): IRegistroArmazenagemController => {
  return container.resolve<IRegistroArmazenagemController>(Symbol.for('IRegistroArmazenagemController'));
};

/**
 * @swagger
 * /api/registros-armazenagem:
 *   get:
 *     tags:
 *       - Registros de Armazenagem
 *     summary: Lista registros de armazenagem
 *     description: Retorna uma lista paginada de registros de armazenagem do tenant atual
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
 *         description: Lista de registros de armazenagem
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
 *                         $ref: '#/components/schemas/RegistroArmazenagemResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *   post:
 *     tags:
 *       - Registros de Armazenagem
 *     summary: Cria um novo registro de armazenagem
 *     description: Cria um novo registro de armazenagem (carga ou descarga) no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRegistroArmazenagemDto'
 *           examples:
 *             carga:
 *               summary: Criar registro de carga
 *               value:
 *                 tipo: Carga
 *                 data: "2026-03-04"
 *                 hora: "14:30:00"
 *                 idProduto: 1
 *                 idUnidadeMedida: 1
 *                 idOrigem: 1
 *                 idUnidadeDeposito: 1
 *                 idMotorista: 1
 *                 ticket: "T-001"
 *                 peso_liquido: 1000
 *                 desconto_umidade: 2.5
 *                 desconto_impureza: 1.0
 *     responses:
 *       201:
 *         description: Registro de armazenagem criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistroArmazenagemResponseDto'
 *       400:
 *         description: Erro de validação ou regra de negócio
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('registroArmazenagem.read'), asyncHandler(async (req, res) => {
  await getRegistroArmazenagemController().index(req, res);
}));

/**
 * @swagger
 * /api/registros-armazenagem/periodo:
 *   get:
 *     tags:
 *       - Registros de Armazenagem
 *     summary: Busca registros por período
 *     description: Retorna todos os registros de armazenagem em um período específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início do período (formato YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim do período (formato YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de registros no período
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RegistroArmazenagemResponseDto'
 *       400:
 *         description: Parâmetros dataInicio e dataFim são obrigatórios
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/periodo', requirePermission('registroArmazenagem.read'), asyncHandler(async (req, res) => {
  await getRegistroArmazenagemController().findByPeriodo(req, res);
}));

/**
 * @swagger
 * /api/registros-armazenagem/unidade-deposito/{id}:
 *   get:
 *     tags:
 *       - Registros de Armazenagem
 *     summary: Busca registros por unidade de depósito
 *     description: Retorna todos os registros de armazenagem de uma unidade de depósito específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da unidade de depósito
 *     responses:
 *       200:
 *         description: Lista de registros da unidade de depósito
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RegistroArmazenagemResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/unidade-deposito/:id', requirePermission('registroArmazenagem.read'), asyncHandler(async (req, res) => {
  await getRegistroArmazenagemController().findByUnidadeDeposito(req, res);
}));

/**
 * @swagger
 * /api/registros-armazenagem/produto/{id}:
 *   get:
 *     tags:
 *       - Registros de Armazenagem
 *     summary: Busca registros por produto
 *     description: Retorna todos os registros de armazenagem de um produto específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto (id_prod)
 *     responses:
 *       200:
 *         description: Lista de registros do produto
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RegistroArmazenagemResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/produto/:id', requirePermission('registroArmazenagem.read'), asyncHandler(async (req, res) => {
  await getRegistroArmazenagemController().findByProduto(req, res);
}));

/**
 * @swagger
 * /api/registros-armazenagem/saldo/{id}:
 *   get:
 *     tags:
 *       - Registros de Armazenagem
 *     summary: Consulta saldo de uma unidade de depósito
 *     description: Retorna o saldo atual (cargas - descargas) de uma unidade de depósito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da unidade de depósito
 *     responses:
 *       200:
 *         description: Saldo atual da unidade de depósito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 saldo:
 *                   type: number
 *                   description: Saldo atual (peso líquido das cargas menos peso líquido das descargas)
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/saldo/:id', requirePermission('registroArmazenagem.read'), asyncHandler(async (req, res) => {
  await getRegistroArmazenagemController().getSaldoByUnidade(req, res);
}));

/**
 * @swagger
 * /api/registros-armazenagem/{id}:
 *   get:
 *     tags:
 *       - Registros de Armazenagem
 *     summary: Busca registro de armazenagem por ID
 *     description: Retorna um registro de armazenagem específico por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do registro de armazenagem
 *     responses:
 *       200:
 *         description: Registro de armazenagem encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistroArmazenagemResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Registro de armazenagem não encontrado
 *   put:
 *     tags:
 *       - Registros de Armazenagem
 *     summary: Atualiza um registro de armazenagem
 *     description: Atualiza um registro de armazenagem existente
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
 *             $ref: '#/components/schemas/UpdateRegistroArmazenagemDto'
 *     responses:
 *       200:
 *         description: Registro de armazenagem atualizado com sucesso
 *       400:
 *         description: Erro de validação ou regra de negócio
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Registro de armazenagem não encontrado
 *   delete:
 *     tags:
 *       - Registros de Armazenagem
 *     summary: Remove um registro de armazenagem
 *     description: Remove um registro de armazenagem do sistema
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
 *         description: Registro de armazenagem removido com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Registro de armazenagem não encontrado
 */
router.get('/:id', requirePermission('registroArmazenagem.read'), asyncHandler(async (req, res) => {
  await getRegistroArmazenagemController().show(req, res);
}));

router.post(
  '/',
  requirePermission('registroArmazenagem.create'),
  validateDto(CreateRegistroArmazenagemDto),
  asyncHandler(async (req, res) => {
    await getRegistroArmazenagemController().create(req, res);
  })
);

router.put(
  '/:id',
  requirePermission('registroArmazenagem.update'),
  validateDtoUpdate(UpdateRegistroArmazenagemDto),
  asyncHandler(async (req, res) => {
    await getRegistroArmazenagemController().update(req, res);
  })
);

router.delete('/:id', requirePermission('registroArmazenagem.delete'), asyncHandler(async (req, res) => {
  await getRegistroArmazenagemController().delete(req, res);
}));

export default router;
