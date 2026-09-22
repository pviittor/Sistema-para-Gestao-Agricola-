import { IApplicationService } from '../IApplicationService';
import { CreateTituloPagarDto } from '../../dto/tituloPagar/CreateTituloPagarDto';
import { CreateTituloPagarCompletoDto } from '../../dto/tituloPagar/CreateTituloPagarCompletoDto';
import { UpdateTituloPagarDto } from '../../dto/tituloPagar/UpdateTituloPagarDto';
import { TituloPagarResponseDto } from '../../dto/tituloPagar/TituloPagarResponseDto';
import { StatusTituloPagar } from '../../../models/TituloPagar';
import { PaginatedResult } from '../../../core/repository/types';

/**
 * Interface para Application Service de TituloPagar
 * 
 * Define os métodos disponíveis para operações de negócio com títulos a pagar.
 */
export interface ITituloPagarApplicationService extends IApplicationService<TituloPagarResponseDto, CreateTituloPagarDto, UpdateTituloPagarDto> {
  /**
   * Busca títulos a pagar por safra
   */
  findBySafra(idSafra: number, page?: number, limit?: number): Promise<PaginatedResult<TituloPagarResponseDto>>;

  /**
   * Busca títulos a pagar por fazenda
   */
  findByFazenda(idFazenda: number, page?: number, limit?: number): Promise<PaginatedResult<TituloPagarResponseDto>>;

  /**
   * Busca títulos a pagar por fornecedor
   */
  findByFornecedor(idFornecedor: number, page?: number, limit?: number): Promise<PaginatedResult<TituloPagarResponseDto>>;

  /**
   * Busca títulos a pagar por status
   */
  findByStatus(status: StatusTituloPagar, page?: number, limit?: number): Promise<PaginatedResult<TituloPagarResponseDto>>;

  /**
   * Busca títulos a pagar por período de lançamento
   */
  findByDataLancamento(dataInicio: string, dataFim: string, page?: number, limit?: number): Promise<PaginatedResult<TituloPagarResponseDto>>;

  /**
   * Cancela um título a pagar
   * Atualiza status do título e de todas as parcelas abertas para CANCELADO/CANCELADA
   */
  cancelar(id: number): Promise<TituloPagarResponseDto>;

  /**
   * Cria um título a pagar completo com parcelas e rateios em uma única transação
   */
  createCompleto(dto: CreateTituloPagarCompletoDto): Promise<TituloPagarResponseDto>;

  /**
   * Retorna KPIs consolidados dos títulos a pagar
   */
  getKpis(filtros?: { idFazenda?: number; idSafra?: number }): Promise<{
    totalAberto: number;
    totalVencido: number;
    totalAVencer30Dias: number;
    totalBaixadoMes: number;
    quantidadeAberto: number;
    quantidadeVencido: number;
  }>;
}
