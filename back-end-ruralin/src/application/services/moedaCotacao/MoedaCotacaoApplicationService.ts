import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IMoedaCotacaoApplicationService } from './IMoedaCotacaoApplicationService';
import { IMoedaCotacaoRepository } from '../../../infrastructure/repository/IMoedaCotacaoRepository';
import { IMoedaRepository } from '../../../infrastructure/repository/IMoedaRepository';
import { CreateMoedaCotacaoDto } from '../../dto/moedaCotacao/CreateMoedaCotacaoDto';
import { UpdateMoedaCotacaoDto } from '../../dto/moedaCotacao/UpdateMoedaCotacaoDto';
import { MoedaCotacaoResponseDto } from '../../dto/moedaCotacao/MoedaCotacaoResponseDto';
import { MoedaCotacaoMapper } from '../../mappers/MoedaCotacaoMapper';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, ForbiddenException } from '../../../core/exceptions';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para MoedaCotacao
 */
@Injectable()
export class MoedaCotacaoApplicationService implements IMoedaCotacaoApplicationService {
  constructor(
    @Inject(TYPES.IMoedaCotacaoRepository) private moedaCotacaoRepository: IMoedaCotacaoRepository,
    @Inject(TYPES.IMoedaRepository) private moedaRepository: IMoedaRepository,
    private mapper: MoedaCotacaoMapper
  ) {}

  @RequirePermission('moedaCotacao.read')
  @Cacheable('moedaCotacao:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<MoedaCotacaoResponseDto>> {
    const result = await this.moedaCotacaoRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  @RequirePermission('moedaCotacao.read')
  @Cacheable('moedaCotacao:getById', 3600)
  async getById(id: number | string): Promise<MoedaCotacaoResponseDto | null> {
    const cotacao = await this.moedaCotacaoRepository.findById(id);
    return cotacao ? this.mapper.toDto(cotacao) : null;
  }

  @RequirePermission('moedaCotacao.read')
  @Cacheable('moedaCotacao:findByMoeda:{0}', 3600)
  async findByMoeda(idMoeda: number): Promise<MoedaCotacaoResponseDto[]> {
    const cotacoes = await this.moedaCotacaoRepository.findByMoeda(idMoeda);
    return cotacoes.map(item => this.mapper.toDto(item));
  }

  @RequirePermission('moedaCotacao.read')
  @Cacheable('moedaCotacao:findByData:{0}', 3600)
  async findByData(data: string | Date): Promise<MoedaCotacaoResponseDto[]> {
    const cotacoes = await this.moedaCotacaoRepository.findByData(data);
    return cotacoes.map(item => this.mapper.toDto(item));
  }

  @RequirePermission('moedaCotacao.create')
  @CacheEvict('moedaCotacao:list:*', true)
  @CacheEvict('moedaCotacao:findByMoeda:*', true)
  @CacheEvict('moedaCotacao:findByData:*', true)
  @Transactional()
  async create(dto: CreateMoedaCotacaoDto): Promise<MoedaCotacaoResponseDto> {
    // Validar se a moeda existe e pertence ao mesmo tenant
    const moeda = await this.moedaRepository.findById(dto.idMoeda);
    if (!moeda) {
      throw new NotFoundException('Moeda não encontrada ou não pertence ao tenant atual');
    }

    const entityData = await this.mapper.toEntity(dto);
    const cotacao = await this.moedaCotacaoRepository.create(entityData);
    return this.mapper.toDto(cotacao);
  }

  @RequirePermission('moedaCotacao.update')
  @CacheEvict('moedaCotacao:list:*', true)
  @CacheEvict('moedaCotacao:getById:*', true)
  @CacheEvict('moedaCotacao:findByMoeda:*', true)
  @CacheEvict('moedaCotacao:findByData:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateMoedaCotacaoDto): Promise<MoedaCotacaoResponseDto> {
    const cotacao = await this.moedaCotacaoRepository.findById(id);
    if (!cotacao) {
      throw new NotFoundException('Cotação de moeda não encontrada');
    }

    // Se estiver atualizando idMoeda, validar cross-tenant
    if (dto.idMoeda !== undefined && dto.idMoeda !== cotacao.idMoeda) {
      const moeda = await this.moedaRepository.findById(dto.idMoeda);
      if (!moeda) {
        throw new NotFoundException('Moeda não encontrada ou não pertence ao tenant atual');
      }
    }
    
    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.moedaCotacaoRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  @RequirePermission('moedaCotacao.delete')
  @CacheEvict('moedaCotacao:list:*', true)
  @CacheEvict('moedaCotacao:getById:*', true)
  @CacheEvict('moedaCotacao:findByMoeda:*', true)
  @CacheEvict('moedaCotacao:findByData:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const cotacao = await this.moedaCotacaoRepository.findById(id);
    if (!cotacao) {
      return false;
    }
    
    await this.moedaCotacaoRepository.delete(id);
    return true;
  }
}
