import { CreateFazendaDto, UpdateFazendaDto, FazendaResponseDto } from '../../dto/fazenda';
import { PaginatedResult } from '../../../core/repository/types';

/**
 * Interface para Application Service de Fazenda
 */
export interface IFazendaApplicationService {
  /**
   * Lista todas as fazendas paginadas
   */
  list(page?: number, limit?: number): Promise<PaginatedResult<FazendaResponseDto>>;

  /**
   * Lista todas as fazendas sem paginação
   */
  listAll(): Promise<FazendaResponseDto[]>;

  /**
   * Busca uma fazenda por ID
   */
  show(id: number): Promise<FazendaResponseDto>;

  /**
   * Busca fazendas por pessoa (produtor)
   */
  findByPessoa(idPessoa: number): Promise<FazendaResponseDto[]>;

  /**
   * Busca fazendas por município
   */
  findByMunicipio(idMunicipio: number): Promise<FazendaResponseDto[]>;

  /**
   * Cria uma nova fazenda
   */
  create(dto: CreateFazendaDto): Promise<FazendaResponseDto>;

  /**
   * Atualiza uma fazenda
   */
  update(id: number, dto: UpdateFazendaDto): Promise<FazendaResponseDto>;

  /**
   * Deleta uma fazenda
   */
  delete(id: number): Promise<boolean>;
}
