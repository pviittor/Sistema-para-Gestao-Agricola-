import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IConfiguradorCicloController } from '../controllers/interfaces/IConfiguradorCicloController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateConfiguradorCicloDto, UpdateConfiguradorCicloDto } from '../application/dto/configuradorCiclo';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getConfiguradorCicloController = (): IConfiguradorCicloController => {
  return container.resolve<IConfiguradorCicloController>(TYPES.IConfiguradorCicloController);
};

/**
 * @swagger
 * /api/configuradoresCiclo:
 *   get:
 *     tags:
 *       - Configuradores de Ciclo
 *     summary: Lista configuradores de ciclo
 *     description: Retorna uma lista paginada de configuradores de ciclo do tenant atual
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
 *         description: Lista de configuradores de ciclo
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('configuradorCiclo.read'), asyncHandler(async (req, res) => {
  await getConfiguradorCicloController().index(req, res);
}));

/**
 * @swagger
 * /api/configuradoresCiclo/fazenda/{fazendaId}/safra/{safraId}:
 *   get:
 *     tags:
 *       - Configuradores de Ciclo
 *     summary: Busca configuradores de ciclo por fazenda e safra
 *     description: Retorna todos os configuradores de ciclo de uma fazenda em uma safra específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fazendaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da fazenda
 *       - in: path
 *         name: safraId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da safra
 *     responses:
 *       200:
 *         description: Lista de configuradores de ciclo da fazenda/safra
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/fazenda/:fazendaId/safra/:safraId', requirePermission('configuradorCiclo.read'), asyncHandler(async (req, res) => {
  await getConfiguradorCicloController().getByFazendaAndSafra(req, res);
}));

/**
 * @swagger
 * /api/configuradoresCiclo/{id}:
 *   get:
 *     tags:
 *       - Configuradores de Ciclo
 *     summary: Busca configurador de ciclo por ID
 *     description: Retorna um configurador de ciclo específico por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do configurador de ciclo
 *     responses:
 *       200:
 *         description: Configurador de ciclo encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Configurador de ciclo não encontrado
 */
router.get('/:id', requirePermission('configuradorCiclo.read'), asyncHandler(async (req, res) => {
  await getConfiguradorCicloController().show(req, res);
}));

/**
 * @swagger
 * /api/configuradoresCiclo:
 *   post:
 *     tags:
 *       - Configuradores de Ciclo
 *     summary: Cria um novo configurador de ciclo
 *     description: Cria um novo configurador de ciclo no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateConfiguradorCicloDto'
 *     responses:
 *       201:
 *         description: Configurador de ciclo criado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post(
  '/',
  requirePermission('configuradorCiclo.create'),
  validateDto(CreateConfiguradorCicloDto),
  asyncHandler(async (req, res) => {
    await getConfiguradorCicloController().create(req, res);
  })
);

/**
 * @swagger
 * /api/configuradoresCiclo/{id}:
 *   put:
 *     tags:
 *       - Configuradores de Ciclo
 *     summary: Atualiza um configurador de ciclo
 *     description: Atualiza um configurador de ciclo existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do configurador de ciclo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateConfiguradorCicloDto'
 *     responses:
 *       200:
 *         description: Configurador de ciclo atualizado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Configurador de ciclo não encontrado
 */
router.put(
  '/:id',
  requirePermission('configuradorCiclo.update'),
  validateDtoUpdate(UpdateConfiguradorCicloDto),
  asyncHandler(async (req, res) => {
    await getConfiguradorCicloController().update(req, res);
  })
);

/**
 * @swagger
 * /api/configuradoresCiclo/{id}:
 *   delete:
 *     tags:
 *       - Configuradores de Ciclo
 *     summary: Remove um configurador de ciclo
 *     description: Remove um configurador de ciclo do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do configurador de ciclo
 *     responses:
 *       204:
 *         description: Configurador de ciclo removido com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Configurador de ciclo não encontrado
 */
router.delete('/:id', requirePermission('configuradorCiclo.delete'), asyncHandler(async (req, res) => {
  await getConfiguradorCicloController().delete(req, res);
}));

export default router;
