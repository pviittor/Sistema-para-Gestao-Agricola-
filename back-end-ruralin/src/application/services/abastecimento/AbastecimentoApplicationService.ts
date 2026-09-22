import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IAbastecimentoApplicationService } from './IAbastecimentoApplicationService';
import { IAbastecimentoRepository } from '../../../infrastructure/repository/IAbastecimentoRepository';
import { IMaquinaRepository } from '../../../infrastructure/repository/IMaquinaRepository';
import { CreateAbastecimentoDto } from '../../dto/abastecimento/CreateAbastecimentoDto';
import { UpdateAbastecimentoDto } from '../../dto/abastecimento/UpdateAbastecimentoDto';
import { AbastecimentoResponseDto } from '../../dto/abastecimento/AbastecimentoResponseDto';
import { AbastecimentoMapper } from '../../mappers/AbastecimentoMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BadRequestException } from '../../../core/exceptions/BadRequestException';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para Abastecimento
 *
 * Implementa a lógica de negócio para operações de abastecimento de máquinas/veículos.
 */
@Injectable()
export class AbastecimentoApplicationService implements IAbastecimentoApplicationService {
  constructor(
    @Inject(TYPES.IAbastecimentoRepository) private abastecimentoRepository: IAbastecimentoRepository,
    @Inject(TYPES.IMaquinaRepository) private maquinaRepository: IMaquinaRepository,
    private mapper: AbastecimentoMapper
  ) {}

  /**
   * Lista todos os abastecimentos com paginação
   */
  @RequirePermission('abastecimento.read')
  @Cacheable('abastecimento:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<AbastecimentoResponseDto>> {
    const result = await this.abastecimentoRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  /**
   * Busca um abastecimento por ID
   */
  @RequirePermission('abastecimento.read')
  @Cacheable('abastecimento:getById', 3600)
  async getById(id: number | string): Promise<AbastecimentoResponseDto | null> {
    const abastecimento = await this.abastecimentoRepository.findById(id);
    return abastecimento ? this.mapper.toDto(abastecimento) : null;
  }

  /**
   * Busca abastecimentos por máquina
   */
  @RequirePermission('abastecimento.read')
  async findByMaquina(idMaquina: number): Promise<AbastecimentoResponseDto[]> {
    const abastecimentos = await this.abastecimentoRepository.findByMaquina(idMaquina);
    return abastecimentos.map(item => this.mapper.toDto(item));
  }

  /**
   * Busca abastecimentos por período
   */
  @RequirePermission('abastecimento.read')
  async findByPeriodo(dataInicio: string, dataFim: string): Promise<AbastecimentoResponseDto[]> {
    const abastecimentos = await this.abastecimentoRepository.findByPeriodo(dataInicio, dataFim);
    return abastecimentos.map(item => this.mapper.toDto(item));
  }

  /**
   * Cria um novo abastecimento
   *
   * Lógica de negócio:
   * 1. Calcula total = volume * preco se não informado
   * 2. Atualiza horimetroAbastecimento da Maquina com kmfim (se kmfim > horimetroAbastecimento atual)
   */
  @RequirePermission('abastecimento.create')
  @Auditable('Abastecimento')
  @CacheEvict('abastecimento:list')
  @Transactional()
  async create(dto: CreateAbastecimentoDto): Promise<AbastecimentoResponseDto> {
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

    // Calcular total se não informado
    if (!dto.total && dto.volume != null && dto.preco != null) {
      (entityData as any).total = Number((dto.volume * dto.preco).toFixed(4));
    }

    (entityData as any).usercreation = userId;
    (entityData as any).tenantId = tenantId;

    const abastecimento = await this.abastecimentoRepository.create(entityData);

    // Atualizar horimetroAbastecimento da Maquina se kmfim > horimetroAbastecimento atual
    try {
      const maquina = await this.maquinaRepository.findById(dto.idMaquina);
      if (maquina) {
        const horimetroAtual = Number(maquina.horimetroAbastecimento) || 0;
        const kmfim = Number(dto.kmfim);
        if (kmfim > horimetroAtual) {
          const updateData: any = { horimetroAbastecimento: kmfim };
          // Também atualizar ultimoHorimetro se necessário
          const ultimoHorimetro = Number(maquina.ultimoHorimetro) || 0;
          if (kmfim > ultimoHorimetro) {
            updateData.ultimoHorimetro = kmfim;
          }
          await this.maquinaRepository.update(dto.idMaquina, updateData);
        }
      }
    } catch {
      // Não falhar o abastecimento se a atualização do horímetro falhar
    }

    return this.mapper.toDto(abastecimento);
  }

  /**
   * Atualiza um abastecimento existente
   */
  @RequirePermission('abastecimento.update')
  @Auditable('Abastecimento')
  @CacheEvict('abastecimento:list:*', true)
  @CacheEvict('abastecimento:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateAbastecimentoDto): Promise<AbastecimentoResponseDto> {
    const abastecimento = await this.abastecimentoRepository.findById(id);
    if (!abastecimento) {
      throw new NotFoundException('Abastecimento não encontrado');
    }

    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.abastecimentoRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um abastecimento
   */
  @RequirePermission('abastecimento.delete')
  @Auditable('Abastecimento')
  @CacheEvict('abastecimento:list:*', true)
  @CacheEvict('abastecimento:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const abastecimento = await this.abastecimentoRepository.findById(id);
    if (!abastecimento) {
      return false;
    }

    await this.abastecimentoRepository.delete(id);
    return true;
  }
}
