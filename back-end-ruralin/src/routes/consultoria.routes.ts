import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IConsultoriaController } from '../controllers/interfaces/IConsultoriaController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateConsultoriaDto, UpdateConsultoriaDto } from '../application/dto/consultoria';
import { asyncHandler } from '../middleware/errorHandler';
import { requireRole } from '../middleware/authorization';
import { consultoriaAccessMiddleware } from '../middleware/consultoriaAccess';

const router = Router();

// Helper para resolver controller de forma lazy
const getConsultoriaController = (): IConsultoriaController => {
  return container.resolve<IConsultoriaController>(TYPES.IConsultoriaController);
};

/**
 * @swagger
 * /api/consultorias:
 *   get:
 *     tags:
 *       - Consultorias
 *     summary: Lista consultorias
 *     description: Retorna uma lista paginada de consultorias (apenas GOD)
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
 *         description: Lista de consultorias
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
 *                         $ref: '#/components/schemas/ConsultoriaResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas usuários GOD podem acessar
 *   post:
 *     tags:
 *       - Consultorias
 *     summary: Cria uma nova consultoria
 *     description: Cria uma nova consultoria no sistema (apenas GOD)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateConsultoriaDto'
 *           examples:
 *             exemplo:
 *               summary: Criar consultoria
 *               value:
 *                 razaoSocial: Consultoria ABC Ltda
 *                 nomeFantasia: ABC Consultoria
 *                 cnpj: '12345678000190'
 *                 email: contato@abcconsultoria.com.br
 *                 telefone: '(11) 98765-4321'
 *                 limiteTenants: 20
 *     responses:
 *       201:
 *         description: Consultoria criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConsultoriaResponseDto'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas usuários GOD podem criar consultorias
 */
router.get('/', requireRole('GOD'), asyncHandler(async (req, res) => {
  await getConsultoriaController().index(req, res);
}));

router.post(
  '/',
  requireRole('GOD'),
  validateDto(CreateConsultoriaDto),
  asyncHandler(async (req, res) => {
    await getConsultoriaController().create(req, res);
  })
);

/**
 * @swagger
 * /api/consultorias/{id}:
 *   get:
 *     tags:
 *       - Consultorias
 *     summary: Obtém consultoria por ID
 *     description: Retorna uma consultoria específica (apenas GOD)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da consultoria
 *     responses:
 *       200:
 *         description: Consultoria encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConsultoriaResponseDto'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas usuários GOD podem acessar
 *       404:
 *         description: Consultoria não encontrada
 *   put:
 *     tags:
 *       - Consultorias
 *     summary: Atualiza consultoria
 *     description: Atualiza uma consultoria existente (apenas GOD)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da consultoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateConsultoriaDto'
 *           examples:
 *             exemplo:
 *               summary: Atualizar consultoria
 *               value:
 *                 nomeFantasia: ABC Consultoria Atualizada
 *                 email: novo@abcconsultoria.com.br
 *     responses:
 *       200:
 *         description: Consultoria atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConsultoriaResponseDto'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas usuários GOD podem atualizar
 *       404:
 *         description: Consultoria não encontrada
 *   delete:
 *     tags:
 *       - Consultorias
 *     summary: Remove uma consultoria
 *     description: Remove uma consultoria do sistema (soft delete - desativa) (apenas GOD)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da consultoria
 *     responses:
 *       204:
 *         description: Consultoria removida com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas usuários GOD podem remover
 *       404:
 *         description: Consultoria não encontrada
 */
router.get('/:id', requireRole('GOD'), asyncHandler(async (req, res) => {
  await getConsultoriaController().show(req, res);
}));

router.put(
  '/:id',
  requireRole('GOD'),
  validateDtoUpdate(UpdateConsultoriaDto),
  asyncHandler(async (req, res) => {
    await getConsultoriaController().update(req, res);
  })
);

router.delete('/:id', requireRole('GOD'), asyncHandler(async (req, res) => {
  await getConsultoriaController().delete(req, res);
}));

/**
 * @swagger
 * /api/consultorias/{id}/desativar:
 *   put:
 *     tags:
 *       - Consultorias
 *     summary: Desativa uma consultoria
 *     description: Desativa uma consultoria e todos os seus tenants (cascade) (apenas GOD)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da consultoria
 *     responses:
 *       200:
 *         description: Consultoria desativada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConsultoriaResponseDto'
 *       400:
 *         description: Consultoria já está desativada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas usuários GOD podem desativar
 *       404:
 *         description: Consultoria não encontrada
 */
router.put('/:id/desativar', requireRole('GOD'), asyncHandler(async (req, res) => {
  await getConsultoriaController().desativar(req, res);
}));

/**
 * @swagger
 * /api/consultorias/{id}/ativar:
 *   put:
 *     tags:
 *       - Consultorias
 *     summary: Ativa uma consultoria
 *     description: Ativa uma consultoria previamente desativada (apenas GOD)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da consultoria
 *     responses:
 *       200:
 *         description: Consultoria ativada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConsultoriaResponseDto'
 *       400:
 *         description: Consultoria já está ativa
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas usuários GOD podem ativar
 *       404:
 *         description: Consultoria não encontrada
 */
router.put('/:id/ativar', requireRole('GOD'), asyncHandler(async (req, res) => {
  await getConsultoriaController().ativar(req, res);
}));

/**
 * @swagger
 * /api/consultorias/{id}/limite-tenants:
 *   put:
 *     tags:
 *       - Consultorias
 *     summary: Aumenta limite de tenants
 *     description: Aumenta o limite de tenants permitidos para uma consultoria (apenas GOD)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da consultoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - novoLimite
 *             properties:
 *               novoLimite:
 *                 type: integer
 *                 minimum: 1
 *                 description: Novo limite de tenants
 *           examples:
 *             exemplo:
 *               summary: Aumentar limite
 *               value:
 *                 novoLimite: 50
 *     responses:
 *       200:
 *         description: Limite atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConsultoriaResponseDto'
 *       400:
 *         description: Novo limite inválido ou menor que quantidade atual
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas usuários GOD podem alterar limite
 *       404:
 *         description: Consultoria não encontrada
 */
router.put('/:id/limite-tenants', requireRole('GOD'), asyncHandler(async (req, res) => {
  await getConsultoriaController().aumentarLimiteTenants(req, res);
}));

/**
 * @swagger
 * /api/consultorias/{id}/tenants:
 *   get:
 *     tags:
 *       - Consultorias
 *     summary: Lista tenants da consultoria
 *     description: Retorna lista de tenants de uma consultoria (GOD ou CONSULTOR da consultoria)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da consultoria
 *     responses:
 *       200:
 *         description: Lista de tenants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TenantResponseDto'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão para acessar esta consultoria
 *       404:
 *         description: Consultoria não encontrada
 */
router.get('/:id/tenants', requireRole(['GOD', 'CONSULTOR']), consultoriaAccessMiddleware, asyncHandler(async (req, res) => {
  await getConsultoriaController().listarTenants(req, res);
}));

export default router;
