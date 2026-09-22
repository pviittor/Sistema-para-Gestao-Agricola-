import { CreateEstadoDto, UpdateEstadoDto, EstadoResponseDto } from '../../dto/estado';
import { PaginatedResult } from '../../../core/repository/types';

/**
 * Interface para Application Service de Estado
 */
export interface IEstadoApplicationService {
  /**
   * Lista todos os estados (disponível para todos autenticados)
   */
  list(page?: number, limit?: number): Promise<PaginatedResult<EstadoResponseDto>>;

  /**
   * Lista todos os estados sem paginação (disponível para todos autenticados)
   */
  listAll(): Promise<EstadoResponseDto[]>;

  /**
   * Busca um estado por ID (disponível para todos autenticados)
   */
  show(id: number): Promise<EstadoResponseDto>;

  /**
   * Busca um estado pela sigla (disponível para todos autenticados)
   */
  findBySigla(sigla: string): Promise<EstadoResponseDto | null>;

  /**
   * Cria um novo estado (apenas GOD)
   */
  create(dto: CreateEstadoDto): Promise<EstadoResponseDto>;

  /**
   * Atualiza um estado (apenas GOD)
   */
  update(id: number, dto: UpdateEstadoDto): Promise<EstadoResponseDto>;

  /**
   * Deleta um estado (apenas GOD)
   */
  delete(id: number): Promise<boolean>;
}
