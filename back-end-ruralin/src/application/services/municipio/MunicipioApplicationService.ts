import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IMunicipioApplicationService } from './IMunicipioApplicationService';
import { IMunicipioRepository } from '../../../infrastructure/repository/IMunicipioRepository';
import { MunicipioMapper } from '../../mappers/MunicipioMapper';
import { CreateMunicipioDto, UpdateMunicipioDto, MunicipioResponseDto } from '../../dto/municipio';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, BadRequestException } from '../../../core/exceptions';
import { RequireRole } from '../../../core/authorization/RequireRole';
import { getRequestContext } from '../../../core/authorization/helpers';
import Municipio from '../../../models/Municipio';

/**
 * Application Service para Municipio
 * 
 * Dados globais - não vinculados a tenant
 * - Listagem disponível para todos autenticados
 * - Manutenção (create/update/delete) apenas para GOD
 */
@Injectable()
export class MunicipioApplicationService implements IMunicipioApplicationService {
  constructor(
    @Inject(TYPES.IMunicipioRepository) private repository: IMunicipioRepository,
    @Inject(MunicipioMapper) private mapper: MunicipioMapper
  ) {}

  /**
   * Lista todos os municípios paginados (disponível para todos autenticados)
   */
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<MunicipioResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map((item: Municipio) => this.mapper.toDto(item)),
    };
  }

  /**
   * Lista todos os municípios sem paginação (disponível para todos autenticados)
   */
  async listAll(): Promise<MunicipioResponseDto[]> {
    const municipios = await this.repository.findAll();
    return municipios.map((municipio) => this.mapper.toDto(municipio));
  }

  /**
   * Busca um município por ID (disponível para todos autenticados)
   */
  async show(id: number): Promise<MunicipioResponseDto> {
    const municipio = await this.repository.findById(id);
    if (!municipio) {
      throw new NotFoundException('Município não encontrado');
    }
    return this.mapper.toDto(municipio);
  }

  /**
   * Busca municípios por estado (disponível para todos autenticados)
   */
  async findByEstado(idEstado: number): Promise<MunicipioResponseDto[]> {
    const municipios = await this.repository.findByEstado(idEstado);
    return municipios.map((municipio) => this.mapper.toDto(municipio));
  }

  /**
   * Busca um município pelo código IBGE (disponível para todos autenticados)
   */
  async findByCodigoIBGE(codigoIBGE: number): Promise<MunicipioResponseDto | null> {
    const municipio = await this.repository.findByCodigoIBGE(codigoIBGE);
    if (!municipio) {
      return null;
    }
    return this.mapper.toDto(municipio);
  }

  /**
   * Cria um novo município (apenas GOD)
   */
  @RequireRole('GOD')
  async create(dto: CreateMunicipioDto): Promise<MunicipioResponseDto> {
    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto não disponível');
    }

    const userId = context.getUserId();
    if (!userId) {
      throw new BadRequestException('Usuário não autenticado');
    }

    // Verificar se já existe município com o mesmo código IBGE (se fornecido)
    if (dto.codigoIBGE) {
      const municipioExistente = await this.repository.findByCodigoIBGE(dto.codigoIBGE);
      if (municipioExistente) {
        throw new BadRequestException('Já existe um município com este código IBGE');
      }
    }

    const entity = this.mapper.toEntity(dto, userId);
    const created = await this.repository.create(entity);
    return this.mapper.toDto(created);
  }

  /**
   * Atualiza um município (apenas GOD)
   */
  @RequireRole('GOD')
  async update(id: number, dto: UpdateMunicipioDto): Promise<MunicipioResponseDto> {
    const municipio = await this.repository.findById(id);
    if (!municipio) {
      throw new NotFoundException('Município não encontrado');
    }

    // Se estiver atualizando o código IBGE, verificar se já existe outro com o mesmo código
    if (dto.codigoIBGE && dto.codigoIBGE !== municipio.codigoIBGE) {
      const municipioExistente = await this.repository.findByCodigoIBGE(dto.codigoIBGE);
      if (municipioExistente && municipioExistente.id !== id) {
        throw new BadRequestException('Já existe um município com este código IBGE');
      }
    }

    const updateData = this.mapper.toUpdateEntity(dto);
    const updated = await this.repository.update(id, updateData);
    return this.mapper.toDto(updated);
  }

  /**
   * Deleta um município (apenas GOD)
   */
  @RequireRole('GOD')
  async delete(id: number): Promise<boolean> {
    const municipio = await this.repository.findById(id);
    if (!municipio) {
      throw new NotFoundException('Município não encontrado');
    }

    return await this.repository.delete(id);
  }
}
