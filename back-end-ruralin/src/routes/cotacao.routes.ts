import { Router } from 'express'
import { container } from '../core/di'
import { TYPES } from '../core/di/types'
import { ICotacaoController } from '../controllers/interfaces/ICotacaoController'
import { validateDto, validateDtoUpdate } from '../middleware/validation'
import { CreateCotacaoDto } from '../application/dto/cotacao/CreateCotacaoDto'
import { CreateCotacaoCompletoDto } from '../application/dto/cotacao/CreateCotacaoCompletoDto'
import { UpdateCotacaoDto } from '../application/dto/cotacao/UpdateCotacaoDto'
import { UpdateCotacaoCompletoDto } from '../application/dto/cotacao/UpdateCotacaoCompletoDto'
import { asyncHandler } from '../middleware/errorHandler'
import { requirePermission } from '../middleware/authorization'

const router = Router()

const getCotacaoController = (): ICotacaoController => {
  return container.resolve<ICotacaoController>(TYPES.ICotacaoController)
}

// ===== Rotas de consulta (ANTES de /:id para evitar conflito) =====

/**
 * GET /api/cotacoes/por-pedido-compra/:pedidoCompraId
 * Lista cotacoes de um pedido de compra
 */
router.get('/por-pedido-compra/:pedidoCompraId', requirePermission('cotacao.read'), asyncHandler(async (req, res) => {
  await getCotacaoController().findByPedidoCompra(req, res)
}))

/**
 * GET /api/cotacoes/por-pedido-compra/:pedidoCompraId/ranking
 * Retorna ranking de cotacoes de um pedido de compra
 */
router.get('/por-pedido-compra/:pedidoCompraId/ranking', requirePermission('cotacao.read'), asyncHandler(async (req, res) => {
  await getCotacaoController().ranking(req, res)
}))

// ===== Master-Detail (completo) =====

/**
 * POST /api/cotacoes/completo
 * Cria cotacao com itens em operacao atomica
 */
router.post(
  '/completo',
  requirePermission('cotacao.create'),
  validateDto(CreateCotacaoCompletoDto),
  asyncHandler(async (req, res) => {
    await getCotacaoController().createCompleto(req, res)
  })
)

// ===== CRUD =====

/**
 * GET /api/cotacoes
 * Lista cotacoes com paginacao
 */
router.get('/', requirePermission('cotacao.read'), asyncHandler(async (req, res) => {
  await getCotacaoController().index(req, res)
}))

/**
 * GET /api/cotacoes/:id
 * Busca cotacao por ID com itens
 */
router.get('/:id', requirePermission('cotacao.read'), asyncHandler(async (req, res) => {
  await getCotacaoController().show(req, res)
}))

/**
 * POST /api/cotacoes
 * Cria cotacao simples (sem itens)
 */
router.post(
  '/',
  requirePermission('cotacao.create'),
  validateDto(CreateCotacaoDto),
  asyncHandler(async (req, res) => {
    await getCotacaoController().create(req, res)
  })
)

/**
 * PUT /api/cotacoes/:id/completo
 * Atualiza cotacao com itens (delete-and-recreate)
 */
router.put(
  '/:id/completo',
  requirePermission('cotacao.update'),
  validateDtoUpdate(UpdateCotacaoCompletoDto),
  asyncHandler(async (req, res) => {
    await getCotacaoController().updateCompleto(req, res)
  })
)

/**
 * PUT /api/cotacoes/:id
 * Atualiza cotacao simples
 */
router.put(
  '/:id',
  requirePermission('cotacao.update'),
  validateDtoUpdate(UpdateCotacaoDto),
  asyncHandler(async (req, res) => {
    await getCotacaoController().update(req, res)
  })
)

/**
 * DELETE /api/cotacoes/:id
 * Remove cotacao
 */
router.delete('/:id', requirePermission('cotacao.delete'), asyncHandler(async (req, res) => {
  await getCotacaoController().delete(req, res)
}))

// ===== Acoes =====

/**
 * POST /api/cotacoes/:id/selecionar
 * Seleciona cotacao como vencedora
 */
router.post('/:id/selecionar', requirePermission('cotacao.update'), asyncHandler(async (req, res) => {
  await getCotacaoController().selecionar(req, res)
}))

export default router
