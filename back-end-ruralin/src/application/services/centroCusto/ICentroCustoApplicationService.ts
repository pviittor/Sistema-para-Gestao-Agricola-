import { CreateCentroCustoDto, UpdateCentroCustoDto, CentroCustoResponseDto } from '../../dto/centroCusto';
import { PaginatedResult } from '../../../core/repository/types';

/**
 * Interface para Application Service de CentroCusto
 */
export interface ICentroCustoApplicationService {
  /**
   * Lista todos os centros de custo paginados
   */
  list(page?: number, limit?: number): Promise<PaginatedResult<CentroCustoResponseDto>>;

  /**
   * Lista todos os centros de custo sem paginação
   */
  listAll(): Promise<CentroCustoResponseDto[]>;

  /**
   * Busca um centro de custo por ID
   */
  show(id: number): Promise<CentroCustoResponseDto>;

  /**
   * Busca centros de custo filhos de um pai específico
   */
  findByPai(centroCustoPaiId: number): Promise<CentroCustoResponseDto[]>;

  /**
   * Cria um novo centro de custo
   */
  create(dto: CreateCentroCustoDto): Promise<CentroCustoResponseDto>;

  /**
   * Atualiza um centro de custo
   */
  update(id: number, dto: UpdateCentroCustoDto): Promise<CentroCustoResponseDto>;

  /**
   * Deleta um centro de custo
   */
  delete(id: number): Promise<boolean>;
}
