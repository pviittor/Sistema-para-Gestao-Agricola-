/**
 * LembreteApplicationService - Application Service para entidade Lembrete
 * 
 * Contém a lógica de negócio para operações com lembretes, separando
 * controllers (HTTP) da lógica de aplicação.
 * 
 * Responsabilidades:
 * - Validações de negócio
 * - Regras de negócio
 * - Orquestração de repositórios e mappers
 * - Transformações de dados
 * 
 * @example
 * ```typescript
 * const service = container.resolve<ILembreteApplicationService>(TYPES.ILembreteApplicationService);
 * 
 * const lembrete = await service.create({
 *   desc_simples: 'Reunião importante',
 *   desc_completa: 'Reunião com a equipe',
 *   // ...
 * });
 * ```
 */

import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { ILembreteApplicationService } from './ILembreteApplicationService';
import { ILembreteRepository } from '../../../infrastructure/repository/ILembreteRepository';
import { LembreteMapper } from '../../mappers/LembreteMapper';
import { CreateLembreteDto } from '../../dto/lembrete/CreateLembreteDto';
import { UpdateLembreteDto } from '../../dto/lembrete/UpdateLembreteDto';
import { LembreteResponseDto } from '../../dto/lembrete/LembreteResponseDto';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { RequirePermission } from '../../../core/authorization';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';

/**
 * Application Service para entidade Lembrete
 * 
 * Implementa lógica de negócio para operações com lembretes, usando
 * repositório para acesso a dados e mapper para conversão DTO-Entidade.
 * 
 * NOTA: LembreteDataHora é tratado separadamente no controller,
 * pois requer lógica específica de relacionamentos.
 */
@Injectable()
export class LembreteApplicationService implements ILembreteApplicationService {
  private mapper: LembreteMapper;

  constructor(
    @Inject(TYPES.ILembreteRepository)
    private repository: ILembreteRepository
  ) {
    // Criar instância do mapper (pode ser injetado no futuro se necessário)
    this.mapper = new LembreteMapper();
  }

  /**
   * Cria um novo lembrete
   * 
   * @param dto - DTO com dados para criação
   * @returns Promise que resolve com o DTO do lembrete criado
   * @throws ForbiddenException se usuário não tiver permissão 'lembrete.create'
   * 
   * NOTA: LembreteDataHora não é criado aqui, será tratado no controller
   */
  @RequirePermission('lembrete.create')
  @Transactional()
  @Auditable('Lembrete')
  @CacheEvict('lembrete:list:*', true)
  @CacheEvict('lembrete:findByUsuario:*', true)
  @CacheEvict('lembrete:findProximos:*', true)
  async create(dto: CreateLembreteDto): Promise<LembreteResponseDto> {
    // Converter DTO para entidade (sem lembrete_data_hora)
    const entity = await this.mapper.toEntity(dto);

    // Criar via repositório
    const created = await this.repository.create(entity as any);

    // Retornar como DTO
    return this.mapper.toDto(created);
  }

  /**
   * Atualiza um lembrete existente
   * 
   * @param id - ID do lembrete
   * @param dto - DTO com dados para atualização
   * @returns Promise que resolve com o DTO do lembrete atualizado
   * @throws NotFoundException se lembrete não for encontrado
   * @throws ForbiddenException se usuário não tiver permissão 'lembrete.update'
   * 
   * NOTA: LembreteDataHora não é atualizado aqui, será tratado no controller
   */
  @RequirePermission('lembrete.update')
  @Transactional()
  @Auditable('Lembrete')
  @CacheEvict('lembrete:getById:{0}')
  @CacheEvict('lembrete:list:*', true)
  @CacheEvict('lembrete:findByUsuario:*', true)
  @CacheEvict('lembrete:findProximos:*', true)
  async update(id: number | string, dto: UpdateLembreteDto): Promise<LembreteResponseDto> {
    // Verificar se lembrete existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Lembrete', id);
    }

    // Converter DTO para entidade (sem lembrete_data_hora)
    const entity = await this.mapper.toEntity(dto);

    // Atualizar via repositório
    const updated = await this.repository.update(id, entity as any);

    // Retornar como DTO
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um lembrete
   * 
   * @param id - ID do lembrete
   * @returns Promise que resolve com true se removido, false caso contrário
   * @throws ForbiddenException se usuário não tiver permissão 'lembrete.delete'
   */
  @RequirePermission('lembrete.delete')
  @Transactional()
  @Auditable('Lembrete')
  @CacheEvict('lembrete:getById:{0}')
  @CacheEvict('lembrete:list:*', true)
  @CacheEvict('lembrete:findByUsuario:*', true)
  @CacheEvict('lembrete:findProximos:*', true)
  async delete(id: number | string): Promise<boolean> {
    // Verificar se lembrete existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      return false;
    }

    // Remover via repositório
    return await this.repository.delete(id);
  }

  /**
   * Busca um lembrete por ID
   * 
   * @param id - ID do lembrete
   * @returns Promise que resolve com o DTO do lembrete encontrado ou null
   * @throws ForbiddenException se usuário não tiver permissão 'lembrete.read'
   */
  //@RequirePermission('lembrete.read')
  @Cacheable('lembrete:getById:{0}', 3600)
  async getById(id: number | string): Promise<LembreteResponseDto | null> {
    const entity = await this.repository.findById(id);
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Lista lembretes com paginação
   * 
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado
   * @throws ForbiddenException se usuário não tiver permissão 'lembrete.read'
   */
  //@RequirePermission('lembrete.read')
  @Cacheable('lembrete:list:{0}:{1}', 300)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<LembreteResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(entity => this.mapper.toDto(entity)),
    };
  }

  /**
   * Busca lembretes por usuário
   * 
   * @param usuarioId - ID do usuário
   * @returns Promise que resolve com array de DTOs de lembretes do usuário
   * @throws ForbiddenException se usuário não tiver permissão 'lembrete.read'
   */
  //@RequirePermission('lembrete.read')
  @Cacheable('lembrete:findByUsuario:{0}', 600)
  async findByUsuario(usuarioId: number): Promise<LembreteResponseDto[]> {
    const entities = await this.repository.findByUsuario(usuarioId);
    return entities.map(entity => this.mapper.toDto(entity));
  }

  /**
   * Busca próximos lembretes
   * 
   * Retorna os lembretes mais próximos baseado nas datas/horários dos
   * LembreteDataHora relacionados, ordenados por data e horário.
   * 
   * @param limite - Número máximo de lembretes a retornar (padrão: 10)
   * @returns Promise que resolve com array de DTOs de próximos lembretes
   * @throws ForbiddenException se usuário não tiver permissão 'lembrete.read'
   */
  //@RequirePermission('lembrete.read')
  @Cacheable('lembrete:findProximos:{0}', 300)
  async findProximos(limite: number = 10): Promise<LembreteResponseDto[]> {
    const entities = await this.repository.findProximos(limite);
    return entities.map(entity => this.mapper.toDto(entity));
  }
}
