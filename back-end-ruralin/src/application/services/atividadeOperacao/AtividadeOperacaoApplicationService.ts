import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IAtividadeOperacaoApplicationService } from './IAtividadeOperacaoApplicationService';
import { IAtividadeOperacaoRepository } from '../../../infrastructure/repository/IAtividadeOperacaoRepository';
import { CreateAtividadeOperacaoDto } from '../../dto/atividadeOperacao/CreateAtividadeOperacaoDto';
import { UpdateAtividadeOperacaoDto } from '../../dto/atividadeOperacao/UpdateAtividadeOperacaoDto';
import { AtividadeOperacaoResponseDto } from '../../dto/atividadeOperacao/AtividadeOperacaoResponseDto';
import { AtividadeOperacaoMapper } from '../../mappers/AtividadeOperacaoMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BadRequestException } from '../../../core/exceptions/BadRequestException';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para AtividadeOperacao
 *
 * Implementa a lógica de negócio para operações de atividades.
 */
@Injectable()
export class AtividadeOperacaoApplicationService implements IAtividadeOperacaoApplicationService {
  constructor(
    @Inject(TYPES.IAtividadeOperacaoRepository) private atividadeOperacaoRepository: IAtividadeOperacaoRepository,
    private mapper: AtividadeOperacaoMapper
  ) {}

  /**
   * Lista todas as operações com paginação
   */
  @RequirePermission('atividadeOperacao.read')
  @Cacheable('atividadeOperacao:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<AtividadeOperacaoResponseDto>> {
    const result = await this.atividadeOperacaoRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  /**
   * Busca uma operação por ID
   */
  @RequirePermission('atividadeOperacao.read')
  @Cacheable('atividadeOperacao:getById', 3600)
  async getById(id: number | string): Promise<AtividadeOperacaoResponseDto | null> {
    const atividadeOperacao = await this.atividadeOperacaoRepository.findById(id);
    return atividadeOperacao ? this.mapper.toDto(atividadeOperacao) : null;
  }

  /**
   * Cria uma nova operação
   */
  @RequirePermission('atividadeOperacao.create')
  @Auditable('AtividadeOperacao')
  @CacheEvict('atividadeOperacao:list')
  @Transactional()
  async create(dto: CreateAtividadeOperacaoDto): Promise<AtividadeOperacaoResponseDto> {
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

    const atividadeOperacao = await this.atividadeOperacaoRepository.create(entityData);

    return this.mapper.toDto(atividadeOperacao);
  }

  /**
   * Atualiza uma operação existente
   */
  @RequirePermission('atividadeOperacao.update')
  @Auditable('AtividadeOperacao')
  @CacheEvict('atividadeOperacao:list:*', true)
  @CacheEvict('atividadeOperacao:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateAtividadeOperacaoDto): Promise<AtividadeOperacaoResponseDto> {
    const atividadeOperacao = await this.atividadeOperacaoRepository.findById(id);
    if (!atividadeOperacao) {
      throw new NotFoundException('Operação não encontrada');
    }

    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.atividadeOperacaoRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove uma operação
   */
  @RequirePermission('atividadeOperacao.delete')
  @Auditable('AtividadeOperacao')
  @CacheEvict('atividadeOperacao:list:*', true)
  @CacheEvict('atividadeOperacao:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const atividadeOperacao = await this.atividadeOperacaoRepository.findById(id);
    if (!atividadeOperacao) {
      return false;
    }

    await this.atividadeOperacaoRepository.delete(id);
    return true;
  }
}
