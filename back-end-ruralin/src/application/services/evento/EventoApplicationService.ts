/**
 * EventoApplicationService - Application Service para entidade Evento
 * 
 * Contém a lógica de negócio para operações com eventos, separando
 * controllers (HTTP) da lógica de aplicação.
 * 
 * Responsabilidades:
 * - Validações de negócio
 * - Regras de negócio (validações de datas, horários)
 * - Orquestração de repositórios e mappers
 * - Transformações de dados
 * 
 * @example
 * ```typescript
 * const service = container.resolve<IEventoApplicationService>(TYPES.IEventoApplicationService);
 * 
 * const evento = await service.create({
 *   titulo: 'Reunião',
 *   data: '2025-01-20',
 *   // ...
 * });
 * ```
 */

import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IEventoApplicationService } from './IEventoApplicationService';
import { IEventoRepository } from '../../../infrastructure/repository/IEventoRepository';
import { ILocalRepository } from '../../../infrastructure/repository/ILocalRepository';
import { ITenantService } from '../../../core/tenant/ITenantService';
import { EventoMapper } from '../../mappers/EventoMapper';
import { CreateEventoDto } from '../../dto/evento/CreateEventoDto';
import { UpdateEventoDto } from '../../dto/evento/UpdateEventoDto';
import { EventoResponseDto } from '../../dto/evento/EventoResponseDto';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, BusinessException, ForbiddenException } from '../../../core/exceptions';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { RequirePermission } from '../../../core/authorization';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';

/**
 * Application Service para entidade Evento
 * 
 * Implementa lógica de negócio para operações com eventos, usando
 * repositório para acesso a dados e mapper para conversão DTO-Entidade.
 */
@Injectable()
export class EventoApplicationService implements IEventoApplicationService {
  private mapper: EventoMapper;

  constructor(
    @Inject(TYPES.IEventoRepository)
    private repository: IEventoRepository,
    @Inject(TYPES.ILocalRepository)
    private localRepository: ILocalRepository,
    @Inject(TYPES.ITenantService)
    private tenantService: ITenantService
  ) {
    // Criar instância do mapper (pode ser injetado no futuro se necessário)
    this.mapper = new EventoMapper();
  }

  /**
   * Cria um novo evento
   * 
   * @param dto - DTO com dados para criação
   * @returns Promise que resolve com o DTO do evento criado
   * @throws BusinessException se validações de negócio falharem
   * @throws ForbiddenException se usuário não tiver permissão 'evento.create'
   */
  @RequirePermission('evento.create')
  @Transactional()
  @Auditable('Evento')
  @CacheEvict('evento:list:*', true)
  @CacheEvict('evento:findByLocal:*', true)
  @CacheEvict('evento:findByData:*', true)
  async create(dto: CreateEventoDto): Promise<EventoResponseDto> {
    // Validação cross-tenant: verificar se local pertence ao mesmo tenant
    const local = await this.localRepository.findById(dto.localId);
    if (!local) {
      throw new NotFoundException('Local', dto.localId);
    }

    const currentTenantId = this.tenantService.getCurrentTenantId();
    if (currentTenantId && (local as any).tenantId !== currentTenantId) {
      throw new ForbiddenException(
        'Local não pertence ao tenant atual',
        'CROSS_TENANT_ACCESS_DENIED'
      );
    }

    // Validação de negócio: verificar se data não é no passado
    const dataEvento = new Date(dto.data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataEvento < hoje) {
      throw new BusinessException('Não é possível criar evento com data no passado');
    }

    // Validação de negócio: verificar se horário de fim é posterior ao de início
    // (já validado no DTO, mas reforçamos aqui)
    const horarioInicio = dto.horario_inicio.split(':').map(Number);
    const horarioFim = dto.horario_fim.split(':').map(Number);
    const inicioMinutos = horarioInicio[0] * 60 + horarioInicio[1];
    const fimMinutos = horarioFim[0] * 60 + horarioFim[1];
    
    if (fimMinutos <= inicioMinutos) {
      throw new BusinessException('Horário de fim deve ser posterior ao horário de início');
    }

    // Converter DTO para entidade
    const entity = await this.mapper.toEntity(dto);

    // Criar via repositório
    const created = await this.repository.create(entity as any);

    // Retornar como DTO
    return this.mapper.toDto(created);
  }

  /**
   * Atualiza um evento existente
   * 
   * @param id - ID do evento
   * @param dto - DTO com dados para atualização
   * @returns Promise que resolve com o DTO do evento atualizado
   * @throws NotFoundException se evento não for encontrado
   * @throws BusinessException se validações de negócio falharem
   * @throws ForbiddenException se usuário não tiver permissão 'evento.update'
   */
  @RequirePermission('evento.update')
  @Transactional()
  @Auditable('Evento')
  @CacheEvict('evento:getById:{0}')
  @CacheEvict('evento:list:*', true)
  @CacheEvict('evento:findByLocal:*', true)
  @CacheEvict('evento:findByData:*', true)
  async update(id: number | string, dto: UpdateEventoDto): Promise<EventoResponseDto> {
    // Verificar se evento existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Evento', id);
    }

    // Validação cross-tenant: verificar se local pertence ao mesmo tenant (se fornecido)
    if (dto.localId) {
      const local = await this.localRepository.findById(dto.localId);
      if (!local) {
        throw new NotFoundException('Local', dto.localId);
      }

      const currentTenantId = this.tenantService.getCurrentTenantId();
      if (currentTenantId && (local as any).tenantId !== currentTenantId) {
        throw new ForbiddenException(
          'Local não pertence ao tenant atual',
          'CROSS_TENANT_ACCESS_DENIED'
        );
      }
    }

    // Validação de negócio: verificar se nova data não é no passado (se fornecida)
    if (dto.data) {
      const dataEvento = new Date(dto.data);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      if (dataEvento < hoje) {
        throw new BusinessException('Não é possível atualizar evento com data no passado');
      }
    }

    // Validação de negócio: verificar horários (se fornecidos)
    if (dto.horario_inicio && dto.horario_fim) {
      const horarioInicio = dto.horario_inicio.split(':').map(Number);
      const horarioFim = dto.horario_fim.split(':').map(Number);
      const inicioMinutos = horarioInicio[0] * 60 + horarioInicio[1];
      const fimMinutos = horarioFim[0] * 60 + horarioFim[1];
      
      if (fimMinutos <= inicioMinutos) {
        throw new BusinessException('Horário de fim deve ser posterior ao horário de início');
      }
    }

    // Converter DTO para entidade
    const entity = await this.mapper.toEntity(dto);

    // Atualizar via repositório
    const updated = await this.repository.update(id, entity as any);

    // Retornar como DTO
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um evento
   * 
   * @param id - ID do evento
   * @returns Promise que resolve com true se removido, false caso contrário
   * @throws ForbiddenException se usuário não tiver permissão 'evento.delete'
   */
  @RequirePermission('evento.delete')
  @Transactional()
  @Auditable('Evento')
  @CacheEvict('evento:getById:{0}')
  @CacheEvict('evento:list:*', true)
  @CacheEvict('evento:findByLocal:*', true)
  @CacheEvict('evento:findByData:*', true)
  async delete(id: number | string): Promise<boolean> {
    // Verificar se evento existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      return false;
    }

    // Remover via repositório
    return await this.repository.delete(id);
  }

  /**
   * Busca um evento por ID
   * 
   * @param id - ID do evento
   * @returns Promise que resolve com o DTO do evento encontrado ou null
   * @throws ForbiddenException se usuário não tiver permissão 'evento.read'
   */
  @RequirePermission('evento.read')
  @Cacheable('evento:getById:{0}', 3600)
  async getById(id: number | string): Promise<EventoResponseDto | null> {
    const entity = await this.repository.findById(id);
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Lista eventos com paginação
   * 
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado
   * @throws ForbiddenException se usuário não tiver permissão 'evento.read'
   */
  @RequirePermission('evento.read')
  @Cacheable('evento:list:{0}:{1}', 300)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<EventoResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(entity => this.mapper.toDto(entity)),
    };
  }

  /**
   * Busca eventos por local
   * 
   * @param localId - ID do local
   * @returns Promise que resolve com array de DTOs de eventos do local
   * @throws ForbiddenException se usuário não tiver permissão 'evento.read'
   */
  @RequirePermission('evento.read')
  @Cacheable('evento:findByLocal:{0}', 600)
  async findByLocal(localId: number): Promise<EventoResponseDto[]> {
    const entities = await this.repository.findByLocal(localId);
    return entities.map(entity => this.mapper.toDto(entity));
  }

  /**
   * Busca eventos por período de datas
   * 
   * @param dataInicio - Data de início do período (inclusive)
   * @param dataFim - Data de fim do período (inclusive)
   * @returns Promise que resolve com array de DTOs de eventos no período
   * @throws ForbiddenException se usuário não tiver permissão 'evento.read'
   */
  @RequirePermission('evento.read')
  @Cacheable('evento:findByData:{0}:{1}', 300)
  async findByData(dataInicio: Date | string, dataFim: Date | string): Promise<EventoResponseDto[]> {
    const entities = await this.repository.findByData(dataInicio, dataFim);
    return entities.map(entity => this.mapper.toDto(entity));
  }
}
