import { BaixaParcelaTituloPagarDto } from '../../dto/parcelaTituloPagar/BaixaParcelaTituloPagarDto';
import { BaixaParcelaTituloReceberDto } from '../../dto/parcelaTituloReceber/BaixaParcelaTituloReceberDto';
import { ParcelaTituloPagarResponseDto } from '../../dto/parcelaTituloPagar/ParcelaTituloPagarResponseDto';
import { ParcelaTituloReceberResponseDto } from '../../dto/parcelaTituloReceber/ParcelaTituloReceberResponseDto';
import { MovimentoFinanceiroTituloPagarResponseDto } from '../../dto/movimentoFinanceiroTituloPagar/MovimentoFinanceiroTituloPagarResponseDto';
import { MovimentoFinanceiroTituloReceberResponseDto } from '../../dto/movimentoFinanceiroTituloReceber/MovimentoFinanceiroTituloReceberResponseDto';

/**
 * Interface para Application Service de Baixa de Parcelas
 * 
 * Define os métodos disponíveis para operações de baixa de parcelas e consulta de movimentos financeiros.
 */
export interface IParcelaApplicationService {
  /**
   * Baixa uma parcela de título a pagar
   * Atualiza a parcela, cria movimentos financeiros e atualiza status do título
   * 
   * @param idParcela - ID da parcela a ser baixada
   * @param dto - DTO com dados da baixa (dataBaixa, valorBaixa, observacao)
   * @returns Promise que resolve com o DTO da parcela atualizada
   */
  baixarParcelaTituloPagar(idParcela: number, dto: BaixaParcelaTituloPagarDto): Promise<ParcelaTituloPagarResponseDto>;

  /**
   * Baixa uma parcela de título a receber
   * Atualiza a parcela, cria movimentos financeiros e atualiza status do título
   * 
   * @param idParcela - ID da parcela a ser baixada
   * @param dto - DTO com dados da baixa (dataBaixa, valorBaixa, observacao)
   * @returns Promise que resolve com o DTO da parcela atualizada
   */
  baixarParcelaTituloReceber(idParcela: number, dto: BaixaParcelaTituloReceberDto): Promise<ParcelaTituloReceberResponseDto>;

  /**
   * Consulta movimentos financeiros de uma parcela de título a pagar
   * 
   * @param idParcela - ID da parcela
   * @returns Promise que resolve com array de DTOs de movimentos financeiros
   */
  consultarMovimentosParcelaTituloPagar(idParcela: number): Promise<MovimentoFinanceiroTituloPagarResponseDto[]>;

  /**
   * Consulta movimentos financeiros de uma parcela de título a receber
   * 
   * @param idParcela - ID da parcela
   * @returns Promise que resolve com array de DTOs de movimentos financeiros
   */
  consultarMovimentosParcelaTituloReceber(idParcela: number): Promise<MovimentoFinanceiroTituloReceberResponseDto[]>;
}
