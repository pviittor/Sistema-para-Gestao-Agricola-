import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { ICfopApplicationService } from './ICfopApplicationService';
import { ICfopRepository } from '../../../infrastructure/repository/ICfopRepository';
import { CreateCfopDto } from '../../dto/cfop/CreateCfopDto';
import { UpdateCfopDto } from '../../dto/cfop/UpdateCfopDto';
import { CfopResponseDto } from '../../dto/cfop/CfopResponseDto';
import { CfopMapper } from '../../mappers/CfopMapper';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions';

/**
 * Application Service para Cfop
 *
 * Implementa a lógica de negócio para operações com CFOP.
 * CFOP é uma entidade global (sem tenant) — tabela de referência fiscal.
 */
@Injectable()
export class CfopApplicationService implements ICfopApplicationService {
  constructor(
    @Inject(TYPES.ICfopRepository) private cfopRepository: ICfopRepository,
    private mapper: CfopMapper
  ) {}

  /**
   * Lista todos os CFOPs com paginação
   */
  @RequirePermission('cfop.read')
  @Cacheable('cfop:list:{0}:{1}', 86400)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<CfopResponseDto>> {
    const result = await this.cfopRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map((item: any) => this.mapper.toDto(item)),
    };
  }

  /**
   * Busca um CFOP por ID
   */
  @RequirePermission('cfop.read')
  @Cacheable('cfop:getById', 86400)
  async getById(id: number | string): Promise<CfopResponseDto | null> {
    const cfop = await this.cfopRepository.findById(id);
    return cfop ? this.mapper.toDto(cfop) : null;
  }

  /**
   * Cria um novo CFOP
   */
  @RequirePermission('cfop.create')
  @CacheEvict('cfop:list:*', true)
  async create(dto: CreateCfopDto): Promise<CfopResponseDto> {
    const entityData = await this.mapper.toEntity(dto);
    const cfop = await this.cfopRepository.create(entityData);
    return this.mapper.toDto(cfop);
  }

  /**
   * Atualiza um CFOP existente
   */
  @RequirePermission('cfop.update')
  @CacheEvict('cfop:list:*', true)
  @CacheEvict('cfop:getById:*', true)
  async update(id: number | string, dto: UpdateCfopDto): Promise<CfopResponseDto> {
    const cfop = await this.cfopRepository.findById(id);
    if (!cfop) {
      throw new NotFoundException('CFOP não encontrado');
    }

    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.cfopRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um CFOP
   */
  @RequirePermission('cfop.delete')
  @CacheEvict('cfop:list:*', true)
  @CacheEvict('cfop:getById:*', true)
  async delete(id: number | string): Promise<boolean> {
    const cfop = await this.cfopRepository.findById(id);
    if (!cfop) {
      return false;
    }

    await this.cfopRepository.delete(id);
    return true;
  }

  /**
   * Busca um CFOP pelo código
   */
  @RequirePermission('cfop.read')
  async findByCodigo(codigo: string): Promise<CfopResponseDto | null> {
    const cfop = await this.cfopRepository.findByCodigo(codigo);
    return cfop ? this.mapper.toDto(cfop) : null;
  }

  /**
   * Lista todos os CFOPs ativos sem paginação
   */
  @RequirePermission('cfop.read')
  @Cacheable('cfop:all', 86400)
  async listAll(): Promise<CfopResponseDto[]> {
    const cfops = await this.cfopRepository.findAllNoPagination();
    return cfops.map(item => this.mapper.toDto(item));
  }
}
