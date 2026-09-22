import { IApplicationService } from '../IApplicationService';
import { CreateMovimentoEstoqueDto } from '../../dto/movimentoEstoque/CreateMovimentoEstoqueDto';
import { UpdateMovimentoEstoqueDto } from '../../dto/movimentoEstoque/UpdateMovimentoEstoqueDto';
import { MovimentoEstoqueResponseDto } from '../../dto/movimentoEstoque/MovimentoEstoqueResponseDto';
import { SaldoEstoqueDto } from '../../dto/movimentoEstoque/SaldoEstoqueDto';
import { PosicaoEstoqueDto } from '../../dto/movimentoEstoque/PosicaoEstoqueDto';
import { KardexProdutoDto } from '../../dto/movimentoEstoque/KardexProdutoDto';
import { HistoricoPrecoResponseDto } from '../../dto/historicoPreco/HistoricoPrecoResponseDto';
import { OperacaoEstoque } from '../../../models/enums/MovimentoEstoqueEnums';

/**
 * Interface para Application Service de MovimentoEstoque
 */
export interface IMovimentoEstoqueApplicationService extends IApplicationService<MovimentoEstoqueResponseDto, CreateMovimentoEstoqueDto, UpdateMovimentoEstoqueDto> {
  /**
   * Retorna saldo por operação
   */
  retornaSaldoPorOperacao(idProduto: number, idFazenda: number, data: string, operacao: OperacaoEstoque): Promise<number>;

  /**
   * Retorna saldo por operação e produtor
   */
  retornaSaldoPorOperacaoProdutor(idProduto: number, idFazenda: number, data: string, operacao: OperacaoEstoque, idProdutor: number): Promise<number>;

  /**
   * Retorna saldo disponível do produtor
   */
  retornaSaldoProdutor(idProduto: number, idFazenda: number, idProdutor: number): Promise<number>;

  /**
   * Retorna saldo geral disponível do produto
   */
  getSaldoProdutoEstoque(idProduto: number, idFazenda: number): Promise<SaldoEstoqueDto>;

  /**
   * Valida se há saldo disponível para a quantidade solicitada
   */
  validaSaldoDisponivel(idProduto: number, idFazenda: number, quantidade: number): Promise<boolean>;

  /**
   * Verifica se produto tem disponibilidade (saldo > 0)
   */
  produtoDisponivel(idProduto: number, idFazenda: number): Promise<boolean>;

  /**
   * Relatório de posição de estoque
   */
  getPosicaoEstoqueRelatorio(): Promise<PosicaoEstoqueDto[]>;

  /**
   * Relatório Kardex de produtos
   */
  getKardexProdutos(dataInicio: string, dataFim: string): Promise<KardexProdutoDto[]>;

  /**
   * Posição de estoque de um produto específico na fazenda
   */
  getPosicaoEstoqueProduto(idProduto: number, idFazenda: number): Promise<PosicaoEstoqueDto | null>;

  /**
   * Extrato de movimentos por data
   */
  getPosicaoEstoqueExtrato(data: string): Promise<MovimentoEstoqueResponseDto[]>;

  /**
   * Histórico de preços de um produto
   */
  getHistoricoPrecos(idProduto: number): Promise<HistoricoPrecoResponseDto[]>;
}
