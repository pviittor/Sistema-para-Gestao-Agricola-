import { IApplicationService } from '../IApplicationService';
import { CreateItemNotaFiscalDto } from '../../dto/itemNotaFiscal/CreateItemNotaFiscalDto';
import { UpdateItemNotaFiscalDto } from '../../dto/itemNotaFiscal/UpdateItemNotaFiscalDto';
import { ItemNotaFiscalResponseDto } from '../../dto/itemNotaFiscal/ItemNotaFiscalResponseDto';

/**
 * Interface para Application Service de ItemNotaFiscal
 */
export interface IItemNotaFiscalApplicationService extends IApplicationService<ItemNotaFiscalResponseDto, CreateItemNotaFiscalDto, UpdateItemNotaFiscalDto> {
  /**
   * Lista todos os itens de uma nota fiscal
   */
  findByNotaFiscal(notaFiscalId: number): Promise<ItemNotaFiscalResponseDto[]>;

  /**
   * Busca historico de movimentacao de produto em notas fiscais
   */
  findByProduto(produtoId: number, dataInicio?: string, dataFim?: string): Promise<ItemNotaFiscalResponseDto[]>;

  /**
   * Rastreabilidade por numero de lote
   */
  findByLote(numeroLote: string, produtoId?: number): Promise<ItemNotaFiscalResponseDto[]>;

  /**
   * Rastreabilidade por numero de serie
   */
  findByNumeroSerie(numeroSerie: string): Promise<ItemNotaFiscalResponseDto | null>;

  /**
   * Consolida quantidade e valor vendido por produto em um periodo
   */
  totalVendidoPorProduto(produtoId: number, dataInicio: string, dataFim: string): Promise<{ qtd: number; vlTotal: number }>;
}
