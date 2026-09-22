import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IOutraDespesaReceitaController } from '../controllers/interfaces/IOutraDespesaReceitaController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateOutraDespesaReceitaDto, UpdateOutraDespesaReceitaDto } from '../application/dto/outraDespesaReceita';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getOutraDespesaReceitaController = (): IOutraDespesaReceitaController => {
  return container.resolve<IOutraDespesaReceitaController>(TYPES.IOutraDespesaReceitaController);
};

/**
 * @swagger
 * /api/outrasDespesasReceitas:
 *   get:
 *     tags:
 *       - Outras Despesas e Receitas
 *     summary: Lista outras despesas/receitas
 *     description: Retorna uma lista paginada de outras despesas/receitas do tenant atual
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
 *         description: Lista de outras despesas/receitas
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('outra_despesa_receita.read'), asyncHandler(async (req, res) => {
  await getOutraDespesaReceitaController().index(req, res);
}));

/**
 * @swagger
 * /api/outrasDespesasReceitas/filtros:
 *   get:
 *     tags:
 *       - Outras Despesas e Receitas
 *     summary: Busca por filtros combinados
 *     description: Retorna outras despesas/receitas filtradas por plano gerencial, período, configurador de ciclo e/ou cultura
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: planoGerencialId
 *         schema:
 *           type: integer
 *         description: ID do plano gerencial
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim (YYYY-MM-DD)
 *       - in: query
 *         name: configuradorCicloId
 *         schema:
 *           type: integer
 *         description: ID do configurador de ciclo
 *       - in: query
 *         name: cultura
 *         schema:
 *           type: string
 *         description: Nome da cultura
 *     responses:
 *       200:
 *         description: Lista filtrada de outras despesas/receitas
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/filtros', requirePermission('outra_despesa_receita.read'), asyncHandler(async (req, res) => {
  await getOutraDespesaReceitaController().findByFilters(req, res);
}));

/**
 * @swagger
 * /api/outrasDespesasReceitas/cultura/{cultura}:
 *   get:
 *     tags:
 *       - Outras Despesas e Receitas
 *     summary: Busca por cultura
 *     description: Retorna outras despesas/receitas de uma cultura específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cultura
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da cultura
 *     responses:
 *       200:
 *         description: Lista de outras despesas/receitas da cultura
 *       400:
 *         description: Parâmetro inválido
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/cultura/:cultura', requirePermission('outra_despesa_receita.read'), asyncHandler(async (req, res) => {
  await getOutraDespesaReceitaController().findByCultura(req, res);
}));

/**
 * @swagger
 * /api/outrasDespesasReceitas/{id}:
 *   get:
 *     tags:
 *       - Outras Despesas e Receitas
 *     summary: Busca por ID
 *     description: Retorna uma outra despesa/receita específica por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da outra despesa/receita
 *     responses:
 *       200:
 *         description: Outra despesa/receita encontrada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Outra despesa/receita não encontrada
 */
router.get('/:id', requirePermission('outra_despesa_receita.read'), asyncHandler(async (req, res) => {
  await getOutraDespesaReceitaController().show(req, res);
}));

/**
 * @swagger
 * /api/outrasDespesasReceitas:
 *   post:
 *     tags:
 *       - Outras Despesas e Receitas
 *     summary: Cria uma nova outra despesa/receita
 *     description: Cria uma nova outra despesa/receita no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOutraDespesaReceitaDto'
 *     responses:
 *       201:
 *         description: Outra despesa/receita criada com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post(
  '/',
  requirePermission('outra_despesa_receita.create'),
  validateDto(CreateOutraDespesaReceitaDto),
  asyncHandler(async (req, res) => {
    await getOutraDespesaReceitaController().create(req, res);
  })
);

/**
 * @swagger
 * /api/outrasDespesasReceitas/{id}:
 *   put:
 *     tags:
 *       - Outras Despesas e Receitas
 *     summary: Atualiza uma outra despesa/receita
 *     description: Atualiza uma outra despesa/receita existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da outra despesa/receita
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOutraDespesaReceitaDto'
 *     responses:
 *       200:
 *         description: Outra despesa/receita atualizada com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Outra despesa/receita não encontrada
 */
router.put(
  '/:id',
  requirePermission('outra_despesa_receita.update'),
  validateDtoUpdate(UpdateOutraDespesaReceitaDto),
  asyncHandler(async (req, res) => {
    await getOutraDespesaReceitaController().update(req, res);
  })
);

/**
 * @swagger
 * /api/outrasDespesasReceitas/{id}:
 *   delete:
 *     tags:
 *       - Outras Despesas e Receitas
 *     summary: Remove uma outra despesa/receita
 *     description: Remove uma outra despesa/receita do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da outra despesa/receita
 *     responses:
 *       204:
 *         description: Outra despesa/receita removida com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Outra despesa/receita não encontrada
 */
router.delete('/:id', requirePermission('outra_despesa_receita.delete'), asyncHandler(async (req, res) => {
  await getOutraDespesaReceitaController().delete(req, res);
}));

export default router;
