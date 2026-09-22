import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IContaApplicationService } from './IContaApplicationService';
import { IContaRepository } from '../../../infrastructure/repository/IContaRepository';
import { ContaMapper } from '../../mappers/ContaMapper';
import { CreateContaDto } from '../../dto/conta/CreateContaDto';
import { UpdateContaDto } from '../../dto/conta/UpdateContaDto';
import { ContaResponseDto } from '../../dto/conta/ContaResponseDto';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, ForbiddenException } from '../../../core/exceptions';
import { RequirePermission } from '../../../core/authorization';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { getRequestContext } from '../../../core/authorization/helpers';
import { IAuditService } from '../../../core/audit/IAuditService';
import Conta from '../../../models/Conta';

/**
 * Application Service para entidade Conta
 * 
 * Implementa lógica de negócio para operações com contas bancárias e caixas.
 */
@Injectable()
export class ContaApplicationService implements IContaApplicationService {
  private mapper: ContaMapper;

  constructor(
    @Inject(TYPES.IAuditService)
    private auditService: IAuditService,
    @Inject(TYPES.IContaRepository)
    private contaRepository: IContaRepository
  ) {
    this.mapper = new ContaMapper();
  }

  /**
   * Lista todas as contas com paginação
   * 
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado
   * @throws ForbiddenException se usuário não tiver permissão 'conta.read'
   */
  @RequirePermission('conta.read')
  @Cacheable('conta:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<ContaResponseDto>> {
    const result = await this.contaRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(entity => this.mapper.toDto(entity)),
    };
  }

  /**
   * Busca uma conta por ID
   * 
   * @param id - ID da conta
   * @returns Promise que resolve com o DTO da conta encontrada ou null
   * @throws ForbiddenException se usuário não tiver permissão 'conta.read'
   */
  @RequirePermission('conta.read')
  @Cacheable('conta:getById:{0}', 3600)
  async getById(id: number | string): Promise<ContaResponseDto | null> {
    const entity = await this.contaRepository.findById(id);
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Cria uma nova conta
   * 
   * @param dto - DTO com dados para criação
   * @returns Promise que resolve com o DTO da conta criada
   * @throws ForbiddenException se usuário não tiver permissão 'conta.create'
   */
  @RequirePermission('conta.create')
  @Transactional()
  @Auditable('Conta')
  @CacheEvict('conta:list:*', true)
  @CacheEvict('conta:findByTipo:*', true)
  async create(dto: CreateContaDto): Promise<ContaResponseDto> {
    const context = getRequestContext();
    if (!context || !context.getUserId()) {
      throw new ForbiddenException(
        'Usuário não autenticado. Não é possível criar conta sem userId.',
        'USER_NOT_AUTHENTICATED'
      );
    }
    const userId = context.getUserId()!;
    const tenantId = context.getTenantId();
    if (!tenantId) {
      throw new ForbiddenException(
        'Tenant não identificado. Não é possível criar conta sem tenantId.',
        'TENANT_NOT_IDENTIFIED'
      );
    }

    // Converter DTO para entidade
    const entity = this.mapper.toEntity(dto, userId, tenantId);

    // Criar conta via repositório
    const created = await this.contaRepository.create(entity as any);

    // Registrar auditoria
    await this.auditService.logCreate('conta', userId, dto);

    // Retornar como DTO
    return this.mapper.toDto(created);
  }

  /**
   * Atualiza uma conta existente
   * 
   * @param id - ID da conta
   * @param dto - DTO com dados para atualização
   * @returns Promise que resolve com o DTO da conta atualizada
   * @throws NotFoundException se conta não for encontrada
   * @throws ForbiddenException se usuário não tiver permissão 'conta.update'
   */
  @RequirePermission('conta.update')
  @Transactional()
  @Auditable('Conta')
  @CacheEvict('conta:getById:{0}')
  @CacheEvict('conta:list:*', true)
  @CacheEvict('conta:findByTipo:*', true)
  async update(id: number | string, dto: UpdateContaDto): Promise<ContaResponseDto> {
    // Verificar se conta existe
    const existing = await this.contaRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Conta', id);
    }

    // Converter DTO para entidade
    const entity = this.mapper.toUpdateEntity(dto);

    // Atualizar via repositório
    const updated = await this.contaRepository.update(id, entity as any);

    // Registrar auditoria
    const context = getRequestContext();
    const userId = context?.getUserId();
    if (userId) {
      await this.auditService.logUpdate('conta', Number(id), existing, dto);
    }

    // Retornar como DTO
    return this.mapper.toDto(updated);
  }

  /**
   * Remove uma conta
   * 
   * @param id - ID da conta
   * @returns Promise que resolve com true se removida, false caso contrário
   * @throws ForbiddenException se usuário não tiver permissão 'conta.delete'
   */
  @RequirePermission('conta.delete')
  @Transactional()
  @Auditable('Conta')
  @CacheEvict('conta:getById:{0}')
  @CacheEvict('conta:list:*', true)
  @CacheEvict('conta:findByTipo:*', true)
  async delete(id: number | string): Promise<boolean> {
    // Verificar se conta existe
    const existing = await this.contaRepository.findById(id);
    if (!existing) {
      return false;
    }

    // Remover via repositório
    const deleted = await this.contaRepository.delete(id);

    // Registrar auditoria
    const context = getRequestContext();
    const userId = context?.getUserId();
    if (userId) {
      await this.auditService.logDelete('conta', Number(id), existing);
    }

    return deleted;
  }

  /**
   * Busca contas por tipo
   * 
   * @param tipo - Tipo da conta (BANCO ou CAIXA)
   * @returns Promise que resolve com array de contas do tipo especificado
   * @throws ForbiddenException se usuário não tiver permissão 'conta.read'
   */
  @RequirePermission('conta.read')
  @Cacheable('conta:findByTipo:{0}', 3600)
  async findByTipo(tipo: string): Promise<ContaResponseDto[]> {
    const entities = await this.contaRepository.findByTipo(tipo);
    return entities.map(entity => this.mapper.toDto(entity));
  }
}
