import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IOrdemServicoController } from '../controllers/interfaces/IOrdemServicoController';
import { validateDto } from '../middleware/validation';
import { CreateOrdemServicoCompletoDto } from '../application/dto/ordemServico/CreateOrdemServicoCompletoDto';
import { UpdateOrdemServicoCompletoDto } from '../application/dto/ordemServico/UpdateOrdemServicoCompletoDto';
import { AtribuirOrdemServicoDto } from '../application/dto/ordemServico/AtribuirOrdemServicoDto';
import { IniciarOrdemServicoDto } from '../application/dto/ordemServico/IniciarOrdemServicoDto';
import { ConcluirOrdemServicoDto } from '../application/dto/ordemServico/ConcluirOrdemServicoDto';
import { ValidarOrdemServicoDto } from '../application/dto/ordemServico/ValidarOrdemServicoDto';
import { CancelarOrdemServicoDto } from '../application/dto/ordemServico/CancelarOrdemServicoDto';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

function getOrdemServicoController(): IOrdemServicoController {
  return container.resolve<IOrdemServicoController>(TYPES.IOrdemServicoController);
}

// GET / — Lista ordens de serviço com paginação e filtros
router.get('/', requirePermission('ordemServico.read'), asyncHandler(async (req, res) => {
  await getOrdemServicoController().list(req, res);
}));

// GET /kpis — KPIs consolidados (ANTES de /:id para evitar que Express trate "kpis" como :id)
router.get('/kpis', requirePermission('ordemServico.read'), asyncHandler(async (req, res) => {
  await getOrdemServicoController().getKpis(req, res);
}));

// --- Endpoints de Consulta (Fase 2B) — ANTES de /:id ---

// GET /custeio — Custeio por talhão/safra
router.get('/custeio', requirePermission('ordemServico.read'), asyncHandler(async (req, res) => {
  await getOrdemServicoController().getCusteio(req, res);
}));

// GET /custeio/resumo — Resumo de custeio por safra
router.get('/custeio/resumo', requirePermission('ordemServico.read'), asyncHandler(async (req, res) => {
  await getOrdemServicoController().getCusteioResumo(req, res);
}));

// GET /timeline — Timeline de OS por dia
router.get('/timeline', requirePermission('ordemServico.dashboard'), asyncHandler(async (req, res) => {
  await getOrdemServicoController().getTimeline(req, res);
}));

// GET /mapa-calor — Mapa de calor por talhão
router.get('/mapa-calor', requirePermission('ordemServico.dashboard'), asyncHandler(async (req, res) => {
  await getOrdemServicoController().getMapaCalor(req, res);
}));

// GET /carga-trabalho — Carga de trabalho dos responsáveis
router.get('/carga-trabalho', requirePermission('ordemServico.dashboard'), asyncHandler(async (req, res) => {
  await getOrdemServicoController().getCargaTrabalho(req, res);
}));

// GET /historico-execucao/:pessoaId — Histórico de execução de um responsável
router.get('/historico-execucao/:pessoaId', requirePermission('ordemServico.dashboard'), asyncHandler(async (req, res) => {
  await getOrdemServicoController().getHistoricoExecucao(req, res);
}));

// --- Endpoints de Analytics (Sprint 7 OS) — ANTES de /:id ---

// GET /analytics/produtividade-operador — Produtividade por operador
router.get('/analytics/produtividade-operador', requirePermission('ordemServico.analytics'), asyncHandler(async (req, res) => {
  await getOrdemServicoController().getProdutividadeOperador(req, res);
}));

// GET /analytics/rendimento-maquina — Rendimento por máquina
router.get('/analytics/rendimento-maquina', requirePermission('ordemServico.analytics'), asyncHandler(async (req, res) => {
  await getOrdemServicoController().getRendimentoMaquina(req, res);
}));

// GET /analytics/custo-categoria — Custo por categoria de atividade
router.get('/analytics/custo-categoria', requirePermission('ordemServico.analytics'), asyncHandler(async (req, res) => {
  await getOrdemServicoController().getCustoCategoria(req, res);
}));

// GET /analytics/ranking-talhoes — Ranking de talhões
router.get('/analytics/ranking-talhoes', requirePermission('ordemServico.analytics'), asyncHandler(async (req, res) => {
  await getOrdemServicoController().getRankingTalhoes(req, res);
}));

// GET /analytics/evolucao-temporal — Evolução temporal de OS
router.get('/analytics/evolucao-temporal', requirePermission('ordemServico.analytics'), asyncHandler(async (req, res) => {
  await getOrdemServicoController().getEvolucaoTemporal(req, res);
}));

// GET /sync — Sync para dispositivos mobile
router.get('/sync', requirePermission('ordemServico.read'), asyncHandler(async (req, res) => {
  await getOrdemServicoController().getSync(req, res);
}));

// GET /:id — Busca por ID
router.get('/:id', requirePermission('ordemServico.read'), asyncHandler(async (req, res) => {
  await getOrdemServicoController().getById(req, res);
}));

// POST /completo — Cria OS completa com todos os filhos
router.post('/completo', requirePermission('ordemServico.create'), validateDto(CreateOrdemServicoCompletoDto), asyncHandler(async (req, res) => {
  await getOrdemServicoController().createCompleto(req, res);
}));

// PUT /:id/completo — Atualiza OS completa com todos os filhos
router.put('/:id/completo', requirePermission('ordemServico.update'), validateDto(UpdateOrdemServicoCompletoDto), asyncHandler(async (req, res) => {
  await getOrdemServicoController().updateCompleto(req, res);
}));

// DELETE /:id — Remove ordem de serviço
router.delete('/:id', requirePermission('ordemServico.delete'), asyncHandler(async (req, res) => {
  await getOrdemServicoController().delete(req, res);
}));

// --- Workflow de status ---

// POST /:id/atribuir — Atribui responsáveis
router.post('/:id/atribuir', requirePermission('ordemServico.update'), validateDto(AtribuirOrdemServicoDto), asyncHandler(async (req, res) => {
  await getOrdemServicoController().atribuir(req, res);
}));

// POST /:id/iniciar — Inicia execução
router.post('/:id/iniciar', requirePermission('ordemServico.update'), validateDto(IniciarOrdemServicoDto), asyncHandler(async (req, res) => {
  await getOrdemServicoController().iniciar(req, res);
}));

// POST /:id/concluir — Conclui OS
router.post('/:id/concluir', requirePermission('ordemServico.update'), validateDto(ConcluirOrdemServicoDto), asyncHandler(async (req, res) => {
  await getOrdemServicoController().concluir(req, res);
}));

// POST /:id/validar — Valida OS concluída
router.post('/:id/validar', requirePermission('ordemServico.update'), validateDto(ValidarOrdemServicoDto), asyncHandler(async (req, res) => {
  await getOrdemServicoController().validar(req, res);
}));

// POST /:id/cancelar — Cancela OS
router.post('/:id/cancelar', requirePermission('ordemServico.delete'), validateDto(CancelarOrdemServicoDto), asyncHandler(async (req, res) => {
  await getOrdemServicoController().cancelar(req, res);
}));

export default router;
