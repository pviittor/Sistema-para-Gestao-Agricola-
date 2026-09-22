import { CreateMunicipioDto, UpdateMunicipioDto, MunicipioResponseDto } from '../../dto/municipio';
import { PaginatedResult } from '../../../core/repository/types';

/**
 * Interface para Application Service de Municipio
 */
export interface IMunicipioApplicationService {
  /**
   * Lista todos os municípios (disponível para todos autenticados)
   */
  list(page?: number, limit?: number): Promise<PaginatedResult<MunicipioResponseDto>>;

  /**
   * Lista todos os municípios sem paginação (disponível para todos autenticados)
   */
  listAll(): Promise<MunicipioResponseDto[]>;

  /**
   * Busca um município por ID (disponível para todos autenticados)
   */
  show(id: number): Promise<MunicipioResponseDto>;

  /**
   * Busca municípios por estado (disponível para todos autenticados)
   */
  findByEstado(idEstado: number): Promise<MunicipioResponseDto[]>;

  /**
   * Busca um município pelo código IBGE (disponível para todos autenticados)
   */
  findByCodigoIBGE(codigoIBGE: number): Promise<MunicipioResponseDto | null>;

  /**
   * Cria um novo município (apenas GOD)
   */
  create(dto: CreateMunicipioDto): Promise<MunicipioResponseDto>;

  /**
   * Atualiza um município (apenas GOD)
   */
  update(id: number, dto: UpdateMunicipioDto): Promise<MunicipioResponseDto>;

  /**
   * Deleta um município (apenas GOD)
   */
  delete(id: number): Promise<boolean>;
}
