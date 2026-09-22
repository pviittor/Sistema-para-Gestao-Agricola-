import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IConfiguradorCicloApplicationService } from './IConfiguradorCicloApplicationService';
import { IConfiguradorCicloRepository } from '../../../infrastructure/repository/IConfiguradorCicloRepository';
import { CreateConfiguradorCicloDto } from '../../dto/configuradorCiclo/CreateConfiguradorCicloDto';
import { UpdateConfiguradorCicloDto } from '../../dto/configuradorCiclo/UpdateConfiguradorCicloDto';
import { ConfiguradorCicloResponseDto } from '../../dto/configuradorCiclo/ConfiguradorCicloResponseDto';
import { ConfiguradorCicloMapper } from '../../mappers/ConfiguradorCicloMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BadRequestException } from '../../../core/exceptions/BadRequestException';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para ConfiguradorCiclo
 *
 * Implementa a lógica de negócio para operações de configuradores de ciclo.
 */
@Injectable()
export class ConfiguradorCicloApplicationService implements IConfiguradorCicloApplicationService {
  constructor(
    @Inject(TYPES.IConfiguradorCicloRepository) private configuradorCicloRepository: IConfiguradorCicloRepository,
    private mapper: ConfiguradorCicloMapper
  ) {}

  /**
   * Lista todos os configuradores de ciclo com paginação
   */
  @RequirePermission('configuradorCiclo.read')
  @Cacheable('configuradorCiclo:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<ConfiguradorCicloResponseDto>> {
    const result = await this.configuradorCicloRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  /**
   * Busca um configurador de ciclo por ID
   */
  @RequirePermission('configuradorCiclo.read')
  @Cacheable('configuradorCiclo:getById', 3600)
  async getById(id: number | string): Promise<ConfiguradorCicloResponseDto | null> {
    const configuradorCiclo = await this.configuradorCicloRepository.findById(id);
    return configuradorCiclo ? this.mapper.toDto(configuradorCiclo) : null;
  }

  /**
   * Busca configuradores de ciclo por fazenda e safra
   */
  @RequirePermission('configuradorCiclo.read')
  @Cacheable('configuradorCiclo:byFazendaSafra:{0}:{1}', 3600)
  async getByFazendaAndSafra(fazendaId: number, safraId: number): Promise<ConfiguradorCicloResponseDto[]> {
    const configuradores = await this.configuradorCicloRepository.findByFazendaAndSafra(fazendaId, safraId);
    return configuradores.map(item => this.mapper.toDto(item));
  }

  /**
   * Cria um novo configurador de ciclo
   */
  @RequirePermission('configuradorCiclo.create')
  @Auditable('ConfiguradorCiclo')
  @CacheEvict('configuradorCiclo:list')
  @Transactional()
  async create(dto: CreateConfiguradorCicloDto): Promise<ConfiguradorCicloResponseDto> {
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

    const configuradorCiclo = await this.configuradorCicloRepository.create(entityData);

    return this.mapper.toDto(configuradorCiclo);
  }

  /**
   * Atualiza um configurador de ciclo existente
   */
  @RequirePermission('configuradorCiclo.update')
  @Auditable('ConfiguradorCiclo')
  @CacheEvict('configuradorCiclo:list:*', true)
  @CacheEvict('configuradorCiclo:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateConfiguradorCicloDto): Promise<ConfiguradorCicloResponseDto> {
    const configuradorCiclo = await this.configuradorCicloRepository.findById(id);
    if (!configuradorCiclo) {
      throw new NotFoundException('Configurador de ciclo não encontrado');
    }

    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.configuradorCicloRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um configurador de ciclo
   */
  @RequirePermission('configuradorCiclo.delete')
  @Auditable('ConfiguradorCiclo')
  @CacheEvict('configuradorCiclo:list:*', true)
  @CacheEvict('configuradorCiclo:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const configuradorCiclo = await this.configuradorCicloRepository.findById(id);
    if (!configuradorCiclo) {
      return false;
    }

    await this.configuradorCicloRepository.delete(id);
    return true;
  }
}
