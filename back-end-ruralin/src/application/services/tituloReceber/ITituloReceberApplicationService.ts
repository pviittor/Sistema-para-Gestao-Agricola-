import { IApplicationService } from '../IApplicationService';
import { CreateTituloReceberDto } from '../../dto/tituloReceber/CreateTituloReceberDto';
import { CreateTituloReceberCompletoDto } from '../../dto/tituloReceber/CreateTituloReceberCompletoDto';
import { UpdateTituloReceberDto } from '../../dto/tituloReceber/UpdateTituloReceberDto';
import { TituloReceberResponseDto } from '../../dto/tituloReceber/TituloReceberResponseDto';
import { StatusTituloReceber } from '../../../models/TituloReceber';
import { PaginatedResult } from '../../../core/repository/types';

/**
 * Interface para Application Service de TituloReceber
 * 
 * Define os métodos disponíveis para operações de negócio com títulos a receber.
 */
export interface ITituloReceberApplicationService extends IApplicationService<TituloReceberResponseDto, CreateTituloReceberDto, UpdateTituloReceberDto> {
  /**
   * Busca títulos a receber por safra
   */
  findBySafra(idSafra: number, page?: number, limit?: number): Promise<PaginatedResult<TituloReceberResponseDto>>;

  /**
   * Busca títulos a receber por fazenda
   */
  findByFazenda(idFazenda: number, page?: number, limit?: number): Promise<PaginatedResult<TituloReceberResponseDto>>;

  /**
   * Busca títulos a receber por cliente
   */
  findByCliente(idCliente: number, page?: number, limit?: number): Promise<PaginatedResult<TituloReceberResponseDto>>;

  /**
   * Busca títulos a receber por status
   */
  findByStatus(status: StatusTituloReceber, page?: number, limit?: number): Promise<PaginatedResult<TituloReceberResponseDto>>;

  /**
   * Busca títulos a receber por período de lançamento
   */
  findByDataLancamento(dataInicio: string, dataFim: string, page?: number, limit?: number): Promise<PaginatedResult<TituloReceberResponseDto>>;

  /**
   * Cancela um título a receber
   * Atualiza status do título e de todas as parcelas abertas para CANCELADO/CANCELADA
   */
  cancelar(id: number): Promise<TituloReceberResponseDto>;

  /**
   * Cria um título a receber completo com parcelas e rateios em uma única transação
   */
  createCompleto(dto: CreateTituloReceberCompletoDto): Promise<TituloReceberResponseDto>;

  /**
   * Retorna KPIs consolidados dos títulos a receber
   */
  getKpis(filtros?: { idFazenda?: number; idSafra?: number }): Promise<{
    totalAberto: number;
    totalVencido: number;
    totalAVencer30Dias: number;
    totalRecebidoMes: number;
    quantidadeAberto: number;
    quantidadeVencido: number;
  }>;
}
