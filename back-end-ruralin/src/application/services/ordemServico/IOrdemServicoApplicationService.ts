import { IApplicationService } from '../IApplicationService';
import { CreateOrdemServicoDto } from '../../dto/ordemServico/CreateOrdemServicoDto';
import { CreateOrdemServicoCompletoDto } from '../../dto/ordemServico/CreateOrdemServicoCompletoDto';
import { UpdateOrdemServicoCompletoDto } from '../../dto/ordemServico/UpdateOrdemServicoCompletoDto';
import { OrdemServicoResponseDto } from '../../dto/ordemServico/OrdemServicoResponseDto';
import { AtribuirOrdemServicoDto } from '../../dto/ordemServico/AtribuirOrdemServicoDto';
import { IniciarOrdemServicoDto } from '../../dto/ordemServico/IniciarOrdemServicoDto';
import { ConcluirOrdemServicoDto } from '../../dto/ordemServico/ConcluirOrdemServicoDto';
import { ValidarOrdemServicoDto } from '../../dto/ordemServico/ValidarOrdemServicoDto';
import { CancelarOrdemServicoDto } from '../../dto/ordemServico/CancelarOrdemServicoDto';
import { PaginatedResult } from '../../../core/repository/types';

/**
 * Filtros disponíveis para listagem de Ordens de Serviço
 */
export interface OrdemServicoFilters {
  status?: string;
  fazendaId?: number;
  tipoAtividadeOSId?: number;
  dataPlanejadaInicio?: string;
  dataPlanejadaFim?: string;
  prioridade?: string;
  safraId?: number;
  /** T11.4 — Filtros de variância */
  atrasadas?: boolean;
  acimaOrcamento?: boolean;
  varianciaMinima?: number;
}

/**
 * KPIs das Ordens de Serviço
 */
export interface OrdemServicoKpis {
  totalPorStatus: {
    PLANEJADA: number;
    AGUARDANDO: number;
    EM_EXECUCAO: number;
    CONCLUIDA: number;
    VALIDADA: number;
    CANCELADA: number;
  };
  totalAtrasadas: number;
  custoTotalReal: number;
  custoTotalEstimado: number;
  totalOS: number;
}

/**
 * Filtros para KPIs de Ordens de Serviço
 */
export interface OrdemServicoKpiFilters {
  fazendaId?: number;
  safraId?: number;
  dataInicio?: string;
  dataFim?: string;
}

/**
 * Interface para Application Service de OrdemServico
 *
 * Define os métodos disponíveis para operações de negócio com ordens de serviço,
 * incluindo CRUD completo, workflow de status e KPIs.
 */
export interface IOrdemServicoApplicationService
  extends IApplicationService<OrdemServicoResponseDto, CreateOrdemServicoDto, UpdateOrdemServicoCompletoDto> {
  /**
   * Lista ordens de serviço com paginação e filtros opcionais
   */
  list(page?: number, limit?: number, filters?: OrdemServicoFilters): Promise<PaginatedResult<OrdemServicoResponseDto>>;

  /**
   * Cria uma OS completa com todos os filhos em uma única transação atômica
   */
  createCompleto(dto: CreateOrdemServicoCompletoDto): Promise<OrdemServicoResponseDto>;

  /**
   * Atualiza uma OS completa com todos os filhos (delete-and-recreate para filhos)
   * Válido apenas para status PLANEJADA ou AGUARDANDO
   */
  updateCompleto(id: number, dto: UpdateOrdemServicoCompletoDto): Promise<OrdemServicoResponseDto>;

  // --- Workflow de status ---

  /**
   * Atribui responsáveis a uma OS e muda status para AGUARDANDO
   * Requer ao menos 1 responsável com funcao=RESPONSAVEL
   */
  atribuir(id: number, dto: AtribuirOrdemServicoDto): Promise<OrdemServicoResponseDto>;

  /**
   * Inicia a execução de uma OS e muda status para EM_EXECUCAO
   * Requer que haja ao menos 1 talhão vinculado
   */
  iniciar(id: number, dto: IniciarOrdemServicoDto): Promise<OrdemServicoResponseDto>;

  /**
   * Conclui uma OS e muda status para CONCLUIDA
   * Calcula custo real e variâncias automaticamente
   */
  concluir(id: number, dto: ConcluirOrdemServicoDto): Promise<OrdemServicoResponseDto>;

  /**
   * Valida uma OS concluída e muda status para VALIDADA
   */
  validar(id: number, dto: ValidarOrdemServicoDto): Promise<OrdemServicoResponseDto>;

  /**
   * Cancela uma OS (qualquer status exceto VALIDADA e CANCELADA)
   */
  cancelar(id: number, dto: CancelarOrdemServicoDto): Promise<OrdemServicoResponseDto>;

  /**
   * Reabre uma OS concluída, voltando para EM_EXECUCAO e limpando dados de conclusão
   */
  reabrir(id: number): Promise<OrdemServicoResponseDto>;

  /**
   * Retorna KPIs consolidados das ordens de serviço
   */
  getKpis(filters?: OrdemServicoKpiFilters): Promise<OrdemServicoKpis>;

  // --- Endpoints de Consulta (Fase 2B) ---

  /**
   * T9.1 — Custeio por talhão/safra com dados agregados de OS concluídas/validadas
   */
  getCusteio(filters: {
    talhaoId?: number;
    safraId?: number;
    fazendaId?: number;
    dataInicio?: string;
    dataFim?: string;
  }, tenantId: number): Promise<any[]>;

  /**
   * T9.2 — Resumo de custeio agrupado por safra
   */
  getCusteioResumo(filters: {
    safraId?: number;
    fazendaId?: number;
    dataInicio?: string;
    dataFim?: string;
  }, tenantId: number): Promise<any[]>;

  /**
   * T10.1 — Timeline de OS por dia (máx 28 dias)
   */
  getTimeline(filters: {
    fazendaId?: number;
    safraId?: number;
    dataInicio: string;
    dataFim: string;
  }, tenantId: number): Promise<any[]>;

  /**
   * T10.2 — Mapa de calor por talhão com agregações de OS
   */
  getMapaCalor(filters: {
    fazendaId?: number;
    safraId?: number;
    status?: string;
    dataInicio?: string;
    dataFim?: string;
  }, tenantId: number): Promise<any[]>;

  /**
   * T12.1 — Carga de trabalho dos responsáveis na semana
   */
  getCargaTrabalho(filters: {
    semana?: string;
    fazendaId?: number;
  }, tenantId: number): Promise<any[]>;

  /**
   * T12.2 — Histórico de execução de um responsável
   */
  getHistoricoExecucao(pessoaId: number, filters: {
    tipoAtividadeOSId?: number;
    dataInicio?: string;
    dataFim?: string;
  }, tenantId: number): Promise<any>;

  // --- Endpoints de Analytics (Sprint 7 OS) ---

  /**
   * T13.1 — Produtividade por operador/responsável
   */
  getProdutividadeOperador(filters: {
    fazendaId?: number;
    safraId?: number;
    dataInicio?: string;
    dataFim?: string;
    tipoAtividadeOSId?: number;
  }, tenantId: number): Promise<any[]>;

  /**
   * T13.2 — Rendimento por máquina
   */
  getRendimentoMaquina(filters: {
    fazendaId?: number;
    safraId?: number;
    dataInicio?: string;
    dataFim?: string;
    tipoAtividadeOSId?: number;
  }, tenantId: number): Promise<any[]>;

  /**
   * T13.3 — Custo por categoria de atividade
   */
  getCustoCategoria(filters: {
    fazendaId?: number;
    safraId?: number;
    dataInicio?: string;
    dataFim?: string;
  }, tenantId: number): Promise<any[]>;

  /**
   * T13.4 — Ranking de talhões por custo/produtividade
   */
  getRankingTalhoes(filters: {
    fazendaId?: number;
    safraId?: number;
    dataInicio?: string;
    dataFim?: string;
    tipoAtividadeOSId?: number;
  }, tenantId: number): Promise<any[]>;

  /**
   * T13.5 — Evolução temporal de OS (por semana ou mês)
   */
  getEvolucaoTemporal(filters: {
    fazendaId?: number;
    safraId?: number;
    dataInicio?: string;
    dataFim?: string;
    agrupamento?: 'semana' | 'mes';
  }, tenantId: number): Promise<any[]>;

  /**
   * T16.2 — Sync endpoint para dispositivos mobile
   */
  getSync(since: string, tenantId: number, limit?: number): Promise<{
    data: any[];
    nextSince: string | null;
  }>;
}
