import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IPessoaController } from '../controllers/interfaces/IPessoaController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreatePessoaDto, UpdatePessoaDto } from '../application/dto/pessoa';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getPessoaController = (): IPessoaController => {
  return container.resolve<IPessoaController>(TYPES.IPessoaController);
};

/**
 * @swagger
 * /api/pessoas:
 *   get:
 *     tags:
 *       - Pessoas
 *     summary: Lista pessoas
 *     description: Retorna uma lista paginada de pessoas do tenant atual
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
 *         description: Lista de pessoas
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
 *                         $ref: '#/components/schemas/PessoaResponseDto'
 *             examples:
 *               success:
 *                 summary: Lista paginada de pessoas
 *                 value:
 *                   data:
 *                     - id_pessoa: 1
 *                       tenantId: 1
 *                       nomerazao_pessoa: João Silva
 *                       cpfcnpj_pessoa: '12345678901'
 *                       tipo_pessoa: 1
 *                       email_pessoa: joao@example.com
 *                       cliente_pessoa: true
 *                       datecreation: '2026-01-16T12:00:00.000Z'
 *                   page: 1
 *                   limit: 10
 *                   total: 1
 *                   totalPages: 1
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *   post:
 *     tags:
 *       - Pessoas
 *     summary: Cria uma nova pessoa
 *     description: Cria uma nova pessoa (física ou jurídica) no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePessoaDto'
 *           examples:
 *             pessoaFisica:
 *               summary: Criar pessoa física
 *               value:
 *                 nomerazao_pessoa: João Silva
 *                 cpfcnpj_pessoa: '12345678901'
 *                 tipo_pessoa: 1
 *                 email_pessoa: joao@example.com
 *                 cliente_pessoa: true
 *                 nascimento_pessoa: '1990-01-15'
 *             pessoaJuridica:
 *               summary: Criar pessoa jurídica
 *               value:
 *                 nomerazao_pessoa: Empresa XYZ Ltda
 *                 nomefantasia_pessoa: XYZ
 *                 cpfcnpj_pessoa: '12345678000190'
 *                 tipo_pessoa: 2
 *                 email_pessoa: contato@xyz.com
 *                 fornecedor_pessoa: true
 *     responses:
 *       201:
 *         description: Pessoa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PessoaResponseDto'
 *             examples:
 *               created:
 *                 summary: Pessoa criada
 *                 value:
 *                   id_pessoa: 1
 *                   tenantId: 1
 *                   nomerazao_pessoa: João Silva
 *                   cpfcnpj_pessoa: '12345678901'
 *                   tipo_pessoa: 1
 *                   cliente_pessoa: true
 *                   datecreation: '2026-01-16T12:00:00.000Z'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('pessoa.read'), asyncHandler(async (req, res) => {
  await getPessoaController().index(req, res);
}));

/**
 * @swagger
 * /api/pessoas/{id}:
 *   get:
 *     tags:
 *       - Pessoas
 *     summary: Busca pessoa por ID
 *     description: Retorna uma pessoa específica por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da pessoa (id_pessoa)
 *     responses:
 *       200:
 *         description: Pessoa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PessoaResponseDto'
 *             examples:
 *               success:
 *                 summary: Pessoa encontrada
 *                 value:
 *                   id_pessoa: 1
 *                   tenantId: 1
 *                   nomerazao_pessoa: João Silva
 *                   cpfcnpj_pessoa: '12345678901'
 *                   tipo_pessoa: 1
 *                   email_pessoa: joao@example.com
 *                   cliente_pessoa: true
 *                   datecreation: '2026-01-16T12:00:00.000Z'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Pessoa não encontrada
 *   put:
 *     tags:
 *       - Pessoas
 *     summary: Atualiza uma pessoa
 *     description: Atualiza uma pessoa existente (atualização parcial)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da pessoa (id_pessoa)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePessoaDto'
 *           examples:
 *             update:
 *               summary: Atualizar pessoa
 *               value:
 *                 nomerazao_pessoa: João Silva Atualizado
 *                 email_pessoa: joao.novo@example.com
 *     responses:
 *       200:
 *         description: Pessoa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PessoaResponseDto'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Pessoa não encontrada
 *   delete:
 *     tags:
 *       - Pessoas
 *     summary: Remove uma pessoa
 *     description: Remove uma pessoa do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da pessoa (id_pessoa)
 *     responses:
 *       204:
 *         description: Pessoa removida com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Pessoa não encontrada
 */
router.get('/:id', requirePermission('pessoa.read'), asyncHandler(async (req, res) => {
  await getPessoaController().show(req, res);
}));

router.post(
  '/',
  requirePermission('pessoa.create'),
  validateDto(CreatePessoaDto),
  asyncHandler(async (req, res) => {
    await getPessoaController().create(req, res);
  })
);

router.put(
  '/:id',
  requirePermission('pessoa.update'),
  validateDtoUpdate(UpdatePessoaDto),
  asyncHandler(async (req, res) => {
    await getPessoaController().update(req, res);
  })
);

router.delete('/:id', requirePermission('pessoa.delete'), asyncHandler(async (req, res) => {
  await getPessoaController().delete(req, res);
}));

export default router;
