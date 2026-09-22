import RecorrenciaFinanceira from '../../models/RecorrenciaFinanceira';
import { IRepository } from '../../core/repository/IRepository';
import { PaginatedResult } from '../../core/repository/types';

/**
 * Filtros para listagem de recorrências financeiras
 */
export interface RecorrenciaFinanceiraFiltros {
  tipo?: string;
  ativa?: boolean;
  periodicidade?: string;
  search?: string;
  idFornecedorCliente?: number;
  idPortador?: number;
  idProdutor?: number;
}

/**
 * KPIs de recorrências financeiras
 */
export interface RecorrenciaFinanceiraKpis {
  totalAtivasPagar: number;
  totalAtivasReceber: number;
  valorTotalPagar: number;
  valorTotalReceber: number;
  totalInativas: number;
  proximasGeracoes: number;
}

/**
 * Interface para repositório de RecorrenciaFinanceira
 */
export interface IRecorrenciaFinanceiraRepository extends IRepository<RecorrenciaFinanceira> {
  /**
   * Busca recorrências ativas (ativa=true, dataInicio <= hoje, dataFim IS NULL ou >= hoje)
   *
   * @param tenantId - ID do tenant (opcional, usa getTenantFilter se não informado)
   * @returns Lista de recorrências financeiras ativas
   */
  findAtivas(tenantId?: number): Promise<RecorrenciaFinanceira[]>;

  /**
   * Busca recorrências por tipo (PAGAR ou RECEBER)
   *
   * @param tipo - Tipo da recorrência (PAGAR ou RECEBER)
   * @param tenantId - ID do tenant
   * @returns Lista de recorrências financeiras do tipo informado
   */
  findByTipo(tipo: string, tenantId: number): Promise<RecorrenciaFinanceira[]>;

  /**
   * Busca recorrências financeiras paginadas com filtros
   */
  findAllPaginatedFiltered(page: number, limit: number, filtros?: RecorrenciaFinanceiraFiltros): Promise<PaginatedResult<RecorrenciaFinanceira>>;

  /**
   * Retorna KPIs das recorrências financeiras do tenant atual
   */
  getKpis(): Promise<RecorrenciaFinanceiraKpis>;
}
