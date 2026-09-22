import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IUnidadeMedidaApplicationService } from './IUnidadeMedidaApplicationService';
import { IUnidadeMedidaRepository } from '../../../infrastructure/repository/IUnidadeMedidaRepository';
import { CreateUnidadeMedidaDto } from '../../dto/unidadeMedida/CreateUnidadeMedidaDto';
import { UpdateUnidadeMedidaDto } from '../../dto/unidadeMedida/UpdateUnidadeMedidaDto';
import { UnidadeMedidaResponseDto } from '../../dto/unidadeMedida/UnidadeMedidaResponseDto';
import { UnidadeMedidaMapper } from '../../mappers/UnidadeMedidaMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, ForbiddenException } from '../../../core/exceptions';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para UnidadeMedida
 * 
 * Implementa a lógica de negócio para operações com unidades de medida.
 */
@Injectable()
export class UnidadeMedidaApplicationService implements IUnidadeMedidaApplicationService {
  constructor(
    @Inject(TYPES.IUnidadeMedidaRepository) private unidadeMedidaRepository: IUnidadeMedidaRepository,
    private mapper: UnidadeMedidaMapper
  ) {}

  /**
   * Lista todas as unidades de medida com paginação
   */
  @RequirePermission('unidadeMedida.read')
  @Cacheable('unidadeMedida:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<UnidadeMedidaResponseDto>> {
    const result = await this.unidadeMedidaRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  /**
   * Busca uma unidade de medida por ID
   */
  @RequirePermission('unidadeMedida.read')
  @Cacheable('unidadeMedida:getById', 3600)
  async getById(id: number | string): Promise<UnidadeMedidaResponseDto | null> {
    const unidadeMedida = await this.unidadeMedidaRepository.findById(id);
    return unidadeMedida ? this.mapper.toDto(unidadeMedida) : null;
  }

  /**
   * Cria uma nova unidade de medida
   */
  @RequirePermission('unidadeMedida.create')
  @Auditable('UnidadeMedida')
  @CacheEvict('unidadeMedida:list:*', true)
  @Transactional()
  async create(dto: CreateUnidadeMedidaDto): Promise<UnidadeMedidaResponseDto> {
    // Obter userId do contexto
    const context = getRequestContext();
    if (!context || !context.getUserId()) {
      throw new ForbiddenException(
        'Usuário não autenticado. Não é possível criar unidade de medida sem userId.',
        'USER_NOT_AUTHENTICATED'
      );
    }
    const userId = context.getUserId()!;

    const entityData = await this.mapper.toEntity(dto);
    
    // Adicionar campos de auditoria
    const entityWithAudit = {
      ...entityData,
      usercreation: userId,
      datecreation: new Date(),
    };

    const unidadeMedida = await this.unidadeMedidaRepository.create(entityWithAudit);
    return this.mapper.toDto(unidadeMedida);
  }

  /**
   * Atualiza uma unidade de medida existente
   */
  @RequirePermission('unidadeMedida.update')
  @Auditable('UnidadeMedida')
  @CacheEvict('unidadeMedida:list:*', true)
  @CacheEvict('unidadeMedida:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateUnidadeMedidaDto): Promise<UnidadeMedidaResponseDto> {
    const unidadeMedida = await this.unidadeMedidaRepository.findById(id);
    if (!unidadeMedida) {
      throw new NotFoundException('Unidade de medida não encontrada');
    }
    
    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.unidadeMedidaRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove uma unidade de medida
   */
  @RequirePermission('unidadeMedida.delete')
  @Auditable('UnidadeMedida')
  @CacheEvict('unidadeMedida:list:*', true)
  @CacheEvict('unidadeMedida:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const unidadeMedida = await this.unidadeMedidaRepository.findById(id);
    if (!unidadeMedida) {
      return false;
    }
    
    await this.unidadeMedidaRepository.delete(id);
    return true;
  }
}
