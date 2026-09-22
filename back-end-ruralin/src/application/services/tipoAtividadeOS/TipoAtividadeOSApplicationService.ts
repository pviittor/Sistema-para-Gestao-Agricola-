import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { ITipoAtividadeOSApplicationService } from './ITipoAtividadeOSApplicationService';
import { ITipoAtividadeOSRepository } from '../../../infrastructure/repository/ITipoAtividadeOSRepository';
import { ICampoCondicionalTipoAtividadeRepository } from '../../../infrastructure/repository/ICampoCondicionalTipoAtividadeRepository';
import { IOrdemServicoRepository } from '../../../infrastructure/repository/IOrdemServicoRepository';
import { TipoAtividadeOSMapper } from '../../mappers/TipoAtividadeOSMapper';
import { CreateTipoAtividadeOSDto } from '../../dto/tipoAtividadeOS/CreateTipoAtividadeOSDto';
import { CreateTipoAtividadeOSCompletoDto } from '../../dto/tipoAtividadeOS/CreateTipoAtividadeOSCompletoDto';
import { UpdateTipoAtividadeOSDto } from '../../dto/tipoAtividadeOS/UpdateTipoAtividadeOSDto';
import { TipoAtividadeOSResponseDto } from '../../dto/tipoAtividadeOS/TipoAtividadeOSResponseDto';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, BusinessException, ForbiddenException } from '../../../core/exceptions';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { RequirePermission } from '../../../core/authorization';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * TipoAtividadeOSApplicationService - Application Service para TipoAtividadeOS
 *
 * Implementa lógica de negócio para tipos de atividade de OS com suporte ao
 * padrão master-detail para CamposCondicionais.
 */
@Injectable()
export class TipoAtividadeOSApplicationService implements ITipoAtividadeOSApplicationService {
  private mapper: TipoAtividadeOSMapper;

  constructor(
    @Inject(TYPES.ITipoAtividadeOSRepository)
    private tipoAtividadeOSRepository: ITipoAtividadeOSRepository,
    @Inject(TYPES.ICampoCondicionalTipoAtividadeRepository)
    private campoCondicionalRepository: ICampoCondicionalTipoAtividadeRepository,
    @Inject(TYPES.IOrdemServicoRepository)
    private ordemServicoRepository: IOrdemServicoRepository
  ) {
    this.mapper = new TipoAtividadeOSMapper();
  }

  /**
   * Lista tipos de atividade com paginação
   */
  @RequirePermission('tipoAtividadeOS.read')
  @Cacheable('tipoAtividadeOS:list:{0}:{1}', 300)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<TipoAtividadeOSResponseDto>> {
    const result = await this.tipoAtividadeOSRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(entity => this.mapper.toDto(entity)),
    };
  }

  /**
   * Lista todos os tipos de atividade sem paginação (para selects/combos)
   */
  @RequirePermission('tipoAtividadeOS.read')
  async listAll(): Promise<TipoAtividadeOSResponseDto[]> {
    const entities = await this.tipoAtividadeOSRepository.findAll();
    return entities.map(entity => this.mapper.toDto(entity));
  }

  /**
   * Busca um tipo de atividade por ID com campos condicionais incluídos
   */
  @RequirePermission('tipoAtividadeOS.read')
  async getById(id: number | string): Promise<TipoAtividadeOSResponseDto | null> {
    const entity = await this.tipoAtividadeOSRepository.findById(id);
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Cria um tipo de atividade (sem campos condicionais)
   */
  @RequirePermission('tipoAtividadeOS.create')
  @Transactional()
  @Auditable('TipoAtividadeOS')
  @CacheEvict('tipoAtividadeOS:list:*', true)
  async create(dto: CreateTipoAtividadeOSDto): Promise<TipoAtividadeOSResponseDto> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    const userId = context?.getUserId();

    if (!tenantId) {
      throw new ForbiddenException('Tenant não identificado.', 'TENANT_NOT_IDENTIFIED');
    }

    const entityData = this.mapper.toEntity(dto) as any;
    entityData.tenantId = tenantId;
    entityData.usercreation = userId;

    const created = await this.tipoAtividadeOSRepository.create(entityData);
    return this.mapper.toDto(created);
  }

  /**
   * Atualiza um tipo de atividade (sem campos condicionais)
   */
  @RequirePermission('tipoAtividadeOS.update')
  @Transactional()
  @Auditable('TipoAtividadeOS')
  @CacheEvict('tipoAtividadeOS:list:*', true)
  async update(id: number | string, dto: UpdateTipoAtividadeOSDto): Promise<TipoAtividadeOSResponseDto> {
    const existing = await this.tipoAtividadeOSRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Tipo de atividade OS', id);
    }

    const entityData = this.mapper.toEntity(dto);
    const updated = await this.tipoAtividadeOSRepository.update(id, entityData as any);
    return this.mapper.toDto(updated);
  }

  /**
   * Cria um tipo de atividade completo com campos condicionais em uma única transação
   */
  @RequirePermission('tipoAtividadeOS.create')
  @Transactional()
  @Auditable('TipoAtividadeOS')
  @CacheEvict('tipoAtividadeOS:list:*', true)
  async createCompleto(dto: CreateTipoAtividadeOSCompletoDto): Promise<TipoAtividadeOSResponseDto> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    const userId = context?.getUserId();

    if (!tenantId) {
      throw new ForbiddenException('Tenant não identificado.', 'TENANT_NOT_IDENTIFIED');
    }

    // Criar o tipo de atividade
    const entityData = this.mapper.toEntity(dto) as any;
    entityData.tenantId = tenantId;
    entityData.usercreation = userId;

    const createdTipo = await this.tipoAtividadeOSRepository.create(entityData);

    // Criar campos condicionais injetando tipoAtividadeOSId e tenantId
    if (dto.camposCondicionais && dto.camposCondicionais.length > 0) {
      for (const campoDto of dto.camposCondicionais) {
        await this.campoCondicionalRepository.create({
          ...campoDto,
          tipoAtividadeOSId: createdTipo.id,
          tenantId,
          usercreation: userId,
        } as any);
      }
    }

    // Retornar tipo completo com campos condicionais
    const completo = await this.tipoAtividadeOSRepository.findById(createdTipo.id);
    return this.mapper.toDto(completo!);
  }

  /**
   * Atualiza um tipo de atividade completo com campos condicionais (delete-and-recreate)
   */
  @RequirePermission('tipoAtividadeOS.update')
  @Transactional()
  @Auditable('TipoAtividadeOS')
  @CacheEvict('tipoAtividadeOS:list:*', true)
  async updateCompleto(
    id: number,
    dto: UpdateTipoAtividadeOSDto & { camposCondicionais?: any[] }
  ): Promise<TipoAtividadeOSResponseDto> {
    const existing = await this.tipoAtividadeOSRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Tipo de atividade OS', id);
    }

    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    const userId = context?.getUserId();

    // Atualizar os campos do tipo de atividade
    const entityData = this.mapper.toEntity(dto);
    await this.tipoAtividadeOSRepository.update(id, entityData as any);

    // Delete-and-recreate para campos condicionais
    if (dto.camposCondicionais !== undefined) {
      await this.campoCondicionalRepository.deleteByTipoAtividade(id);

      for (const campoDto of dto.camposCondicionais) {
        await this.campoCondicionalRepository.create({
          ...campoDto,
          tipoAtividadeOSId: id,
          tenantId,
          usercreation: userId,
        } as any);
      }
    }

    // Retornar tipo completo atualizado
    const completo = await this.tipoAtividadeOSRepository.findById(id);
    return this.mapper.toDto(completo!);
  }

  /**
   * Remove um tipo de atividade
   * Valida que não existem Ordens de Serviço vinculadas antes de remover.
   */
  @RequirePermission('tipoAtividadeOS.delete')
  @CacheEvict('tipoAtividadeOS:list:*', true)
  async delete(id: number | string): Promise<boolean> {
    const existing = await this.tipoAtividadeOSRepository.findById(id);
    if (!existing) {
      return false;
    }

    // Verificar se existem OS vinculadas a este tipo de atividade
    const osVinculadas = await (this.ordemServicoRepository as any).model.count({
      where: {
        tipoAtividadeOSId: Number(id),
        tenantId: getRequestContext()?.getTenantId(),
      },
    });

    if (osVinculadas > 0) {
      throw new BusinessException(
        `Não é possível excluir o tipo de atividade pois existem ${osVinculadas} ordem(ns) de serviço vinculada(s).`,
        'TIPO_ATIVIDADE_COM_OS_VINCULADAS'
      );
    }

    return this.tipoAtividadeOSRepository.delete(id);
  }
}
