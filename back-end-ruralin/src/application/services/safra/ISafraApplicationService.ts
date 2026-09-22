import { CreateSafraDto, UpdateSafraDto, SafraResponseDto } from '../../dto/safra';
import { PaginatedResult } from '../../../core/repository/types';
import { StatusSafra } from '../../../models/Safra';

/**
 * Interface para Application Service de Safra
 */
export interface ISafraApplicationService {
  /**
   * Lista todas as safras paginadas
   */
  list(page?: number, limit?: number): Promise<PaginatedResult<SafraResponseDto>>;

  /**
   * Lista todas as safras sem paginação
   */
  listAll(): Promise<SafraResponseDto[]>;

  /**
   * Busca uma safra por ID
   */
  show(id: number): Promise<SafraResponseDto>;

  /**
   * Busca safras por cultura
   */
  findByCultura(culturaId: number): Promise<SafraResponseDto[]>;

  /**
   * Busca safras por status
   */
  findByStatus(status: StatusSafra): Promise<SafraResponseDto[]>;

  /**
   * Cria uma nova safra
   */
  create(dto: CreateSafraDto): Promise<SafraResponseDto>;

  /**
   * Atualiza uma safra
   */
  update(id: number, dto: UpdateSafraDto): Promise<SafraResponseDto>;

  /**
   * Deleta uma safra
   */
  delete(id: number): Promise<boolean>;
}
