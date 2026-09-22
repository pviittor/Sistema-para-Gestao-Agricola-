import { PaginatedResult } from '../../../core/repository/types';

export interface IRecorrenciaFinanceiraApplicationService {
  create(dto: any): Promise<any>;
  update(id: number | string, dto: any): Promise<any>;
  delete(id: number | string): Promise<boolean>;
  getById(id: number | string): Promise<any | null>;
  list(page?: number, limit?: number, tipo?: string, ativa?: boolean, filtros?: Record<string, unknown>): Promise<PaginatedResult<any>>;
  getKpis(): Promise<any>;
  toggleAtiva(id: number): Promise<any>;
  gerarProximosLancamentos(tenantId?: number): Promise<{ gerados: number; ignorados: number; erros: number }>;
  calcularProximoVencimento(recorrencia: any): Date | null;
  gerarLancamentoManual(id: number): Promise<any>;
  previewProximasGeracoes(dto: any, count: number): Promise<any[]>;
}
