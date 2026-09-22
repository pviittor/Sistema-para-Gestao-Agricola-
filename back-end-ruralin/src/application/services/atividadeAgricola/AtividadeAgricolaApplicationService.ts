import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IAtividadeAgricolaApplicationService } from './IAtividadeAgricolaApplicationService';
import { IAtividadeAgricolaRepository } from '../../../infrastructure/repository/IAtividadeAgricolaRepository';
import { CreateAtividadeAgricolaDto } from '../../dto/atividadeAgricola/CreateAtividadeAgricolaDto';
import { UpdateAtividadeAgricolaDto } from '../../dto/atividadeAgricola/UpdateAtividadeAgricolaDto';
import { AtividadeAgricolaResponseDto } from '../../dto/atividadeAgricola/AtividadeAgricolaResponseDto';
import { AtividadeAgricolaMapper } from '../../mappers/AtividadeAgricolaMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BadRequestException } from '../../../core/exceptions/BadRequestException';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para AtividadeAgricola
 *
 * Implementa a lógica de negócio para operações de atividades agrícolas.
 */
@Injectable()
export class AtividadeAgricolaApplicationService implements IAtividadeAgricolaApplicationService {
  constructor(
    @Inject(TYPES.IAtividadeAgricolaRepository) private atividadeAgricolaRepository: IAtividadeAgricolaRepository,
    private mapper: AtividadeAgricolaMapper
  ) {}

  /**
   * Lista todas as atividades agrícolas com paginação
   */
  @RequirePermission('atividadeAgricola.read')
  @Cacheable('atividadeAgricola:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<AtividadeAgricolaResponseDto>> {
    const result = await this.atividadeAgricolaRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  /**
   * Busca uma atividade agrícola por ID
   */
  @RequirePermission('atividadeAgricola.read')
  @Cacheable('atividadeAgricola:getById', 3600)
  async getById(id: number | string): Promise<AtividadeAgricolaResponseDto | null> {
    const atividadeAgricola = await this.atividadeAgricolaRepository.findById(id);
    return atividadeAgricola ? this.mapper.toDto(atividadeAgricola) : null;
  }

  /**
   * Cria uma nova atividade agrícola
   */
  @RequirePermission('atividadeAgricola.create')
  @Auditable('AtividadeAgricola')
  @CacheEvict('atividadeAgricola:list')
  @Transactional()
  async create(dto: CreateAtividadeAgricolaDto): Promise<AtividadeAgricolaResponseDto> {
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

    const atividadeAgricola = await this.atividadeAgricolaRepository.create(entityData);

    return this.mapper.toDto(atividadeAgricola);
  }

  /**
   * Atualiza uma atividade agrícola existente
   */
  @RequirePermission('atividadeAgricola.update')
  @Auditable('AtividadeAgricola')
  @CacheEvict('atividadeAgricola:list:*', true)
  @CacheEvict('atividadeAgricola:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateAtividadeAgricolaDto): Promise<AtividadeAgricolaResponseDto> {
    const atividadeAgricola = await this.atividadeAgricolaRepository.findById(id);
    if (!atividadeAgricola) {
      throw new NotFoundException('Atividade agrícola não encontrada');
    }

    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.atividadeAgricolaRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove uma atividade agrícola
   */
  @RequirePermission('atividadeAgricola.delete')
  @Auditable('AtividadeAgricola')
  @CacheEvict('atividadeAgricola:list:*', true)
  @CacheEvict('atividadeAgricola:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const atividadeAgricola = await this.atividadeAgricolaRepository.findById(id);
    if (!atividadeAgricola) {
      return false;
    }

    await this.atividadeAgricolaRepository.delete(id);
    return true;
  }
}
