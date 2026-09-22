import { IRepository } from '../../core/repository/IRepository';
import ItemNotaFiscal from '../../models/ItemNotaFiscal';

/**
 * Interface para repositorio de ItemNotaFiscal
 */
export interface IItemNotaFiscalRepository extends IRepository<ItemNotaFiscal> {
  /**
   * Lista todos os itens de uma nota fiscal
   */
  findByNotaFiscal(notaFiscalId: number): Promise<ItemNotaFiscal[]>;

  /**
   * Busca historico de movimentacao de produto em notas fiscais
   */
  findByProduto(produtoId: number, dataInicio?: string, dataFim?: string): Promise<ItemNotaFiscal[]>;

  /**
   * Rastreabilidade por numero de lote
   */
  findByLote(numeroLote: string, produtoId?: number): Promise<ItemNotaFiscal[]>;

  /**
   * Rastreabilidade por numero de serie
   */
  findByNumeroSerie(numeroSerie: string): Promise<ItemNotaFiscal | null>;

  /**
   * Consolida quantidade e valor vendido por produto em um periodo
   */
  totalVendidoPorProduto(produtoId: number, dataInicio: string, dataFim: string): Promise<{ qtd: number; vlTotal: number }>;

  /**
   * Remove todos os itens de uma nota fiscal (usado no padrao delete-and-recreate)
   */
  deleteByNotaFiscal(notaFiscalId: number): Promise<number>;
}
