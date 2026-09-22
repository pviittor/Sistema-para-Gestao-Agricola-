import { IRepository } from '../../core/repository/IRepository';
import MovimentoEstoque from '../../models/MovimentoEstoque';
import { OperacaoEstoque } from '../../models/enums/MovimentoEstoqueEnums';

/**
 * Interface para repositório de MovimentoEstoque
 */
export interface IMovimentoEstoqueRepository extends IRepository<MovimentoEstoque> {
  /**
   * Retorna o saldo (SUM quantidade) filtrado por produto, fazenda, data e operação
   */
  retornaSaldoPorOperacao(idProduto: number, idFazenda: number, data: string, operacao: OperacaoEstoque): Promise<number>;

  /**
   * Retorna o saldo filtrado por produto, fazenda, data, operação e produtor
   */
  retornaSaldoPorOperacaoProdutor(idProduto: number, idFazenda: number, data: string, operacao: OperacaoEstoque, idProdutor: number): Promise<number>;

  /**
   * Retorna o saldo DISPONÍVEL para o produtor informado
   */
  retornaSaldoProdutor(idProduto: number, idFazenda: number, idProdutor: number): Promise<number>;

  /**
   * Retorna o saldo geral DISPONÍVEL do produto na fazenda
   */
  getSaldoProdutoEstoque(idProduto: number, idFazenda: number): Promise<number>;

  /**
   * Retorna soma de entradas (totalQuantidade + totalValor) para cálculo de custo médio
   */
  getSomaEntradas(idProduto: number, idFazenda: number): Promise<{ totalQuantidade: number; totalValor: number }>;

  /**
   * Busca movimentos por produto e fazenda
   */
  findByProdutoFazenda(idProduto: number, idFazenda: number): Promise<MovimentoEstoque[]>;

  /**
   * Busca movimentos por período
   */
  findByPeriodo(dataInicio: string, dataFim: string): Promise<MovimentoEstoque[]>;
}
