import { IRepository } from '../../core/repository/IRepository';
import NotaFiscal from '../../models/NotaFiscal';

/**
 * Interface para repositorio de NotaFiscal
 */
export interface INotaFiscalRepository extends IRepository<NotaFiscal> {
  /**
   * Busca nota fiscal pela chave de acesso NF-e
   */
  findByChaveAcesso(chaveAcesso: string): Promise<NotaFiscal | null>;

  /**
   * Lista notas fiscais por periodo de emissao
   */
  findByPeriodo(dataInicio: string, dataFim: string, tipo?: string, status?: string): Promise<NotaFiscal[]>;

  /**
   * Lista notas fiscais por emitente
   */
  findByEmitente(emitenteId: number, tipo?: string): Promise<NotaFiscal[]>;

  /**
   * Lista notas fiscais por destinatario
   */
  findByDestinatario(destinatarioId: number): Promise<NotaFiscal[]>;

  /**
   * Busca notas autorizadas que ainda nao movimentaram estoque
   */
  findPendentesMovimentacao(tipo?: string): Promise<NotaFiscal[]>;

  /**
   * Busca notas autorizadas sem financeiro gerado
   */
  findPendentesFinanceiro(tipo?: string): Promise<NotaFiscal[]>;

  /**
   * Soma de totais agrupados por tipo/periodo
   */
  totalPorPeriodo(dataInicio: string, dataFim: string): Promise<{ tipo: string; total: number; qtd: number }[]>;

  /**
   * Busca nota fiscal por numero, serie e modelo
   */
  findByNumeroSerie(numero: string, serie: string, modelo: string): Promise<NotaFiscal | null>;

  /**
   * Busca nota fiscal por ID incluindo todos os itens e seus produtos (para resposta completa)
   */
  findByIdWithDetails(id: number): Promise<NotaFiscal | null>;
}
