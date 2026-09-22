import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IEmprestimoController } from '../controllers/interfaces/IEmprestimoController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateEmprestimoDto, UpdateEmprestimoDto } from '../application/dto/emprestimo';
import { CreateEmprestimoCompletoDto } from '../application/dto/emprestimo/CreateEmprestimoCompletoDto';
import { UpdateEmprestimoCompletoDto } from '../application/dto/emprestimo/UpdateEmprestimoCompletoDto';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getEmprestimoController = (): IEmprestimoController => {
  return container.resolve<IEmprestimoController>(TYPES.IEmprestimoController);
};

/**
 * GET /api/emprestimos
 *
 * Lista empréstimos com paginação.
 * Inclui dados de fazenda e parceiro.
 * Permissão necessária: emprestimo.read
 */
router.get('/', requirePermission('emprestimo.read'), asyncHandler(async (req, res) => {
  await getEmprestimoController().index(req, res);
}));

/**
 * GET /api/emprestimos/por-fazenda/:fazendaId
 *
 * Busca empréstimos por fazenda.
 * IMPORTANTE: Esta rota deve ficar ANTES de /:id para evitar conflito de parâmetros.
 * Permissão necessária: emprestimo.read
 */
router.get('/por-fazenda/:fazendaId', requirePermission('emprestimo.read'), asyncHandler(async (req, res) => {
  await getEmprestimoController().findByFazenda(req, res);
}));

/**
 * GET /api/emprestimos/por-parceiro/:parceiroId
 *
 * Busca empréstimos por parceiro.
 * IMPORTANTE: Esta rota deve ficar ANTES de /:id para evitar conflito de parâmetros.
 * Permissão necessária: emprestimo.read
 */
router.get('/por-parceiro/:parceiroId', requirePermission('emprestimo.read'), asyncHandler(async (req, res) => {
  await getEmprestimoController().findByParceiro(req, res);
}));

/**
 * GET /api/emprestimos/por-situacao/:situacao
 *
 * Busca empréstimos por situação (0=Em aberto, 1=Parcialmente devolvido, 2=Concluído).
 * IMPORTANTE: Esta rota deve ficar ANTES de /:id para evitar conflito de parâmetros.
 * Permissão necessária: emprestimo.read
 */
router.get('/por-situacao/:situacao', requirePermission('emprestimo.read'), asyncHandler(async (req, res) => {
  await getEmprestimoController().findBySituacao(req, res);
}));

/**
 * GET /api/emprestimos/:id
 *
 * Busca empréstimo por ID.
 * Inclui dados de fazenda e parceiro.
 * Permissão necessária: emprestimo.read
 */
router.get('/:id', requirePermission('emprestimo.read'), asyncHandler(async (req, res) => {
  await getEmprestimoController().show(req, res);
}));

/**
 * POST /api/emprestimos/:id/gerar-financeiro
 *
 * Gera título a receber (cobrança) para empréstimo vencido.
 * Calcula valor base + multa + juros por dias de atraso.
 * IMPORTANTE: Esta rota deve ficar ANTES de POST / e /:id genérico.
 *
 * Response: TituloReceberResponseDto
 * Permissão necessária: emprestimo.gerar_financeiro
 */
router.post(
  '/:id/gerar-financeiro',
  requirePermission('emprestimo.gerar_financeiro'),
  asyncHandler(async (req, res) => {
    await getEmprestimoController().gerarFinanceiro(req, res);
  })
);

/**
 * POST /api/emprestimos/completo
 *
 * Cria um empréstimo com todos os seus itens de forma atômica (em uma única transação).
 * IMPORTANTE: Esta rota deve ficar ANTES de POST / para evitar ambiguidade de parsing.
 *
 * Body: CreateEmprestimoCompletoDto
 * Response: EmprestimoResponseDto (com itens)
 * Permissão necessária: emprestimo.create
 */
router.post(
  '/completo',
  requirePermission('emprestimo.create'),
  validateDto(CreateEmprestimoCompletoDto),
  asyncHandler(async (req, res) => {
    await getEmprestimoController().createCompleto(req, res);
  })
);

/**
 * POST /api/emprestimos
 *
 * Cria um novo empréstimo.
 *
 * Body: CreateEmprestimoDto
 * Response: EmprestimoResponseDto
 * Permissão necessária: emprestimo.create
 */
router.post(
  '/',
  requirePermission('emprestimo.create'),
  validateDto(CreateEmprestimoDto),
  asyncHandler(async (req, res) => {
    await getEmprestimoController().create(req, res);
  })
);

/**
 * PUT /api/emprestimos/:id/completo
 *
 * Atualiza um empréstimo e todos os seus itens de forma atômica (em uma única transação).
 * Os itens existentes são substituídos pelos itens enviados no body (delete-and-recreate).
 * IMPORTANTE: Esta rota deve ficar ANTES de PUT /:id para evitar conflito de parâmetros.
 *
 * Body: UpdateEmprestimoCompletoDto
 * Response: EmprestimoResponseDto (com itens)
 * Permissão necessária: emprestimo.update
 */
router.put(
  '/:id/completo',
  requirePermission('emprestimo.update'),
  validateDtoUpdate(UpdateEmprestimoCompletoDto),
  asyncHandler(async (req, res) => {
    await getEmprestimoController().updateCompleto(req, res);
  })
);

/**
 * PUT /api/emprestimos/:id
 *
 * Atualiza um empréstimo existente.
 *
 * Body: UpdateEmprestimoDto
 * Response: EmprestimoResponseDto
 * Permissão necessária: emprestimo.update
 */
router.put(
  '/:id',
  requirePermission('emprestimo.update'),
  validateDtoUpdate(UpdateEmprestimoDto),
  asyncHandler(async (req, res) => {
    await getEmprestimoController().update(req, res);
  })
);

/**
 * DELETE /api/emprestimos/:id
 *
 * Remove um empréstimo.
 * Não é possível remover se houver itens cadastrados.
 *
 * Permissão necessária: emprestimo.delete
 */
router.delete('/:id', requirePermission('emprestimo.delete'), asyncHandler(async (req, res) => {
  await getEmprestimoController().delete(req, res);
}));

export default router;
