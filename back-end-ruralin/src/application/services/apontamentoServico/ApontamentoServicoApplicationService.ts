import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IApontamentoServicoApplicationService } from './IApontamentoServicoApplicationService';
import { IApontamentoServicoRepository } from '../../../infrastructure/repository/IApontamentoServicoRepository';
import { CreateApontamentoServicoDto } from '../../dto/apontamentoServico/CreateApontamentoServicoDto';
import { UpdateApontamentoServicoDto } from '../../dto/apontamentoServico/UpdateApontamentoServicoDto';
import { ApontamentoServicoResponseDto } from '../../dto/apontamentoServico/ApontamentoServicoResponseDto';
import { ApontamentoServicoMapper } from '../../mappers/ApontamentoServicoMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BadRequestException } from '../../../core/exceptions/BadRequestException';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para ApontamentoServico
 *
 * Implementa a lógica de negócio para operações de apontamento de serviço.
 * CRUD simples sem lógica de negócio adicional.
 */
@Injectable()
export class ApontamentoServicoApplicationService implements IApontamentoServicoApplicationService {
  constructor(
    @Inject(TYPES.IApontamentoServicoRepository) private apontamentoServicoRepository: IApontamentoServicoRepository,
    private mapper: ApontamentoServicoMapper
  ) {}

  /**
   * Lista todos os apontamentos de serviço com paginação
   */
  @RequirePermission('apontamentoServico.read')
  @Cacheable('apontamentoServico:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<ApontamentoServicoResponseDto>> {
    const result = await this.apontamentoServicoRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  /**
   * Busca um apontamento de serviço por ID
   */
  @RequirePermission('apontamentoServico.read')
  @Cacheable('apontamentoServico:getById', 3600)
  async getById(id: number | string): Promise<ApontamentoServicoResponseDto | null> {
    const apontamentoServico = await this.apontamentoServicoRepository.findById(id);
    return apontamentoServico ? this.mapper.toDto(apontamentoServico) : null;
  }

  /**
   * Cria um novo apontamento de serviço
   */
  @RequirePermission('apontamentoServico.create')
  @Auditable('ApontamentoServico')
  @CacheEvict('apontamentoServico:list')
  @Transactional()
  async create(dto: CreateApontamentoServicoDto): Promise<ApontamentoServicoResponseDto> {
    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto não disponível');
    }

    const userId = context.getUserId();
    const tenantId = context.getTenantId();

    if (!userId || !tenantId) {
      throw new BadRequestException('Usuário não autenticado ou tenant não identificado');
    }

    const entityData = await this.mapper.toEntity(dto);

    (entityData as any).usercreation = userId;
    (entityData as any).tenantId = tenantId;

    const apontamentoServico = await this.apontamentoServicoRepository.create(entityData);

    return this.mapper.toDto(apontamentoServico);
  }

  /**
   * Atualiza um apontamento de serviço existente
   */
  @RequirePermission('apontamentoServico.update')
  @Auditable('ApontamentoServico')
  @CacheEvict('apontamentoServico:list:*', true)
  @CacheEvict('apontamentoServico:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateApontamentoServicoDto): Promise<ApontamentoServicoResponseDto> {
    const apontamentoServico = await this.apontamentoServicoRepository.findById(id);
    if (!apontamentoServico) {
      throw new NotFoundException('ApontamentoServico', String(id));
    }

    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.apontamentoServicoRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um apontamento de serviço
   */
  @RequirePermission('apontamentoServico.delete')
  @Auditable('ApontamentoServico')
  @CacheEvict('apontamentoServico:list:*', true)
  @CacheEvict('apontamentoServico:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const apontamentoServico = await this.apontamentoServicoRepository.findById(id);
    if (!apontamentoServico) {
      return false;
    }

    await this.apontamentoServicoRepository.delete(id);
    return true;
  }
}
