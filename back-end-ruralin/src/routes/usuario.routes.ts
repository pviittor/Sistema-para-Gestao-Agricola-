import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IUsuarioController } from '../controllers/interfaces/IUsuarioController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateUsuarioDto, UpdateUsuarioDto } from '../application/dto/usuario';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getUsuarioController = (): IUsuarioController => {
  return container.resolve<IUsuarioController>(TYPES.IUsuarioController);
};

/**
 * @swagger
 * /api/usuarios/me:
 *   get:
 *     tags:
 *       - Usuários
 *     summary: Retorna informações do usuário autenticado
 *     description: Retorna os dados completos do usuário atualmente autenticado, incluindo roles e sub-usuários
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioDetailResponseDto'
 *             examples:
 *               success:
 *                 summary: Dados do usuário autenticado
 *                 value:
 *                   id: 1
 *                   tenantId: 1
 *                   nome: João Silva
 *                   username: joao.silva
 *                   email: joao@example.com
 *                   whatsapp: +5511999999999
 *                   tipo: CLIENT
 *                   roles:
 *                     - id: 1
 *                       nome: Administrador
 *                   subUsuarios:
 *                     - id: 2
 *                       nome: Maria Santos
 *                       username: maria.santos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/me', requirePermission('usuario.read'), asyncHandler(async (req, res) => {
  await getUsuarioController().me(req, res);
}));

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     tags:
 *       - Usuários
 *     summary: Lista usuários
 *     description: Retorna uma lista paginada de usuários do tenant atual, incluindo sub-usuários
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
 *         description: Lista de usuários
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
 *                         $ref: '#/components/schemas/UsuarioResponseDto'
 *             examples:
 *               success:
 *                 summary: Lista paginada de usuários
 *                 value:
 *                   data:
 *                     - id: 1
 *                       tenantId: 1
 *                       nome: João Silva
 *                       username: joao.silva
 *                       email: joao@example.com
 *                       tipo: CLIENT
 *                   page: 1
 *                   limit: 10
 *                   total: 1
 *                   totalPages: 1
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('usuario.read'), asyncHandler(async (req, res) => {
  await getUsuarioController().index(req, res);
}));

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     tags:
 *       - Usuários
 *     summary: Busca usuário por ID
 *     description: Retorna um usuário específico por ID, incluindo roles e sub-usuários
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioDetailResponseDto'
 *             examples:
 *               success:
 *                 summary: Usuário com relacionamentos
 *                 value:
 *                   id: 1
 *                   tenantId: 1
 *                   nome: João Silva
 *                   username: joao.silva
 *                   email: joao@example.com
 *                   tipo: CLIENT
 *                   roles:
 *                     - id: 1
 *                       nome: Administrador
 *                   subUsuarios:
 *                     - id: 2
 *                       nome: Maria Santos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/:id', requirePermission('usuario.read'), asyncHandler(async (req, res) => {
  await getUsuarioController().show(req, res);
}));

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     tags:
 *       - Usuários
 *     summary: Cria um novo usuário
 *     description: Cria um novo usuário no tenant atual. A senha será automaticamente hasheada. Roles podem ser associadas através do campo roleIds.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUsuarioDto'
 *           examples:
 *             create:
 *               summary: Criar usuário CLIENT
 *               value:
 *                 nome: João Silva
 *                 username: joao.silva
 *                 email: joao@example.com
 *                 senha: Senha123
 *                 whatsapp: +5511999999999
 *                 tipo: CLIENT
 *                 apiKey: key123
 *                 apiUrl: https://api.example.com
 *                 roleIds: [1, 2]
 *             createRoot:
 *               summary: Criar usuário ROOT
 *               value:
 *                 nome: Admin Sistema
 *                 username: admin
 *                 email: admin@example.com
 *                 senha: Admin123
 *                 tipo: ROOT
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioResponseDto'
 *             examples:
 *               success:
 *                 summary: Usuário criado
 *                 value:
 *                   id: 1
 *                   tenantId: 1
 *                   nome: João Silva
 *                   username: joao.silva
 *                   email: joao@example.com
 *                   tipo: CLIENT
 *                   createdAt: '2026-01-17T13:00:00.000Z'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post(
  '/',
  requirePermission('usuario.create'),
  validateDto(CreateUsuarioDto),
  asyncHandler(async (req, res) => {
    await getUsuarioController().create(req, res);
  })
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     tags:
 *       - Usuários
 *     summary: Atualiza um usuário existente
 *     description: Atualiza um usuário existente. Todos os campos são opcionais, permitindo atualizações parciais. Roles e sub-usuários podem ser atualizados através dos campos roleIds e subUsuarios.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUsuarioDto'
 *           examples:
 *             update:
 *               summary: Atualizar dados básicos
 *               value:
 *                 nome: João Silva Atualizado
 *                 email: novoemail@example.com
 *             updateWithRoles:
 *               summary: Atualizar com roles
 *               value:
 *                 nome: João Silva
 *                 roleIds: [1, 3]
 *             updateWithSubUsuarios:
 *               summary: Atualizar com sub-usuários
 *               value:
 *                 nome: João Silva
 *                 subUsuarios:
 *                   - nome: Maria Santos
 *                     username: maria.santos
 *                     email: maria@example.com
 *                     senha: Senha123
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioResponseDto'
 *             examples:
 *               success:
 *                 summary: Usuário atualizado
 *                 value:
 *                   id: 1
 *                   tenantId: 1
 *                   nome: João Silva Atualizado
 *                   username: joao.silva
 *                   email: novoemail@example.com
 *                   tipo: CLIENT
 *                   updatedAt: '2026-01-17T13:30:00.000Z'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Usuário não encontrado
 */
router.put(
  '/:id',
  requirePermission('usuario.update'),
  validateDtoUpdate(UpdateUsuarioDto),
  asyncHandler(async (req, res) => {
    await getUsuarioController().update(req, res);
  })
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     tags:
 *       - Usuários
 *     summary: Remove um usuário
 *     description: Remove um usuário do sistema. Também remove todas as associações de roles e sub-usuários relacionados.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário a ser removido
 *     responses:
 *       204:
 *         description: Usuário removido com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Usuário não encontrado
 */
router.delete('/:id', requirePermission('usuario.delete'), asyncHandler(async (req, res) => {
  await getUsuarioController().delete(req, res);
}));

export default router;
