import { Request, Response } from 'express';

/**
 * Interface para Controller de OrdemServico
 *
 * Define os métodos HTTP disponíveis para operações com ordens de serviço,
 * incluindo CRUD completo, workflow de status e KPIs.
 */
export interface IOrdemServicoController {
  /**
   * Lista ordens de serviço com paginação e filtros
   * GET /api/ordens-servico?page=1&limit=10&status=PLANEJADA&fazendaId=1...
   */
  list(req: Request, res: Response): Promise<void>;

  /**
   * Busca uma ordem de serviço por ID
   * GET /api/ordens-servico/:id
   */
  getById(req: Request, res: Response): Promise<void>;

  /**
   * Cria uma OS completa com todos os filhos em uma única transação
   * POST /api/ordens-servico/completo
   */
  createCompleto(req: Request, res: Response): Promise<void>;

  /**
   * Atualiza uma OS completa com todos os filhos
   * PUT /api/ordens-servico/:id/completo
   */
  updateCompleto(req: Request, res: Response): Promise<void>;

  /**
   * Remove uma ordem de serviço
   * DELETE /api/ordens-servico/:id
   */
  delete(req: Request, res: Response): Promise<void>;

  // --- Workflow de status ---

  /**
   * Atribui responsáveis a uma OS
   * POST /api/ordens-servico/:id/atribuir
   */
  atribuir(req: Request, res: Response): Promise<void>;

  /**
   * Inicia a execução de uma OS
   * POST /api/ordens-servico/:id/iniciar
   */
  iniciar(req: Request, res: Response): Promise<void>;

  /**
   * Conclui uma OS
   * POST /api/ordens-servico/:id/concluir
   */
  concluir(req: Request, res: Response): Promise<void>;

  /**
   * Valida uma OS concluída
   * POST /api/ordens-servico/:id/validar
   */
  validar(req: Request, res: Response): Promise<void>;

  /**
   * Cancela uma OS
   * POST /api/ordens-servico/:id/cancelar
   */
  cancelar(req: Request, res: Response): Promise<void>;

  /**
   * Retorna KPIs consolidados das ordens de serviço
   * GET /api/ordens-servico/kpis
   */
  getKpis(req: Request, res: Response): Promise<void>;

  // --- Endpoints de Consulta (Fase 2B) ---

  /**
   * Custeio por talhão/safra
   * GET /api/ordens-servico/custeio
   */
  getCusteio(req: Request, res: Response): Promise<void>;

  /**
   * Resumo de custeio por safra
   * GET /api/ordens-servico/custeio/resumo
   */
  getCusteioResumo(req: Request, res: Response): Promise<void>;

  /**
   * Timeline de OS por dia
   * GET /api/ordens-servico/timeline
   */
  getTimeline(req: Request, res: Response): Promise<void>;

  /**
   * Mapa de calor por talhão
   * GET /api/ordens-servico/mapa-calor
   */
  getMapaCalor(req: Request, res: Response): Promise<void>;

  /**
   * Carga de trabalho dos responsáveis
   * GET /api/ordens-servico/carga-trabalho
   */
  getCargaTrabalho(req: Request, res: Response): Promise<void>;

  /**
   * Histórico de execução de um responsável
   * GET /api/ordens-servico/historico-execucao/:pessoaId
   */
  getHistoricoExecucao(req: Request, res: Response): Promise<void>;

  // --- Endpoints de Analytics (Sprint 7 OS) ---

  /**
   * Produtividade por operador/responsável
   * GET /api/ordens-servico/analytics/produtividade-operador
   */
  getProdutividadeOperador(req: Request, res: Response): Promise<void>;

  /**
   * Rendimento por máquina
   * GET /api/ordens-servico/analytics/rendimento-maquina
   */
  getRendimentoMaquina(req: Request, res: Response): Promise<void>;

  /**
   * Custo por categoria de atividade
   * GET /api/ordens-servico/analytics/custo-categoria
   */
  getCustoCategoria(req: Request, res: Response): Promise<void>;

  /**
   * Ranking de talhões por custo/produtividade
   * GET /api/ordens-servico/analytics/ranking-talhoes
   */
  getRankingTalhoes(req: Request, res: Response): Promise<void>;

  /**
   * Evolução temporal de OS por semana ou mês
   * GET /api/ordens-servico/analytics/evolucao-temporal
   */
  getEvolucaoTemporal(req: Request, res: Response): Promise<void>;

  /**
   * Sync endpoint para dispositivos mobile
   * GET /api/ordens-servico/sync
   */
  getSync(req: Request, res: Response): Promise<void>;
}
