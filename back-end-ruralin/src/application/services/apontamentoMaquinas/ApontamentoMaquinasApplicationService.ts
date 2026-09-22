import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IApontamentoMaquinasApplicationService } from './IApontamentoMaquinasApplicationService';
import { IApontamentoMaquinasRepository } from '../../../infrastructure/repository/IApontamentoMaquinasRepository';
import { IMaquinaRepository } from '../../../infrastructure/repository/IMaquinaRepository';
import { CreateApontamentoMaquinasDto } from '../../dto/apontamentoMaquinas/CreateApontamentoMaquinasDto';
import { UpdateApontamentoMaquinasDto } from '../../dto/apontamentoMaquinas/UpdateApontamentoMaquinasDto';
import { ApontamentoMaquinasResponseDto } from '../../dto/apontamentoMaquinas/ApontamentoMaquinasResponseDto';
import { ApontamentoMaquinasMapper } from '../../mappers/ApontamentoMaquinasMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BadRequestException } from '../../../core/exceptions/BadRequestException';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para ApontamentoMaquinas
 *
 * Implementa a logica de negocio para operacoes de apontamento de maquinas.
 * Inclui logica para atualizar horimetro da maquina apos criacao.
 */
@Injectable()
export class ApontamentoMaquinasApplicationService implements IApontamentoMaquinasApplicationService {
  constructor(
    @Inject(TYPES.IApontamentoMaquinasRepository) private apontamentoMaquinasRepository: IApontamentoMaquinasRepository,
    @Inject(TYPES.IMaquinaRepository) private maquinaRepository: IMaquinaRepository,
    private mapper: ApontamentoMaquinasMapper
  ) {}

  /**
   * Lista todos os apontamentos de maquinas com paginacao
   */
  @RequirePermission('apontamentoMaquinas.read')
  @Cacheable('apontamentoMaquinas:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<ApontamentoMaquinasResponseDto>> {
    const result = await this.apontamentoMaquinasRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  /**
   * Busca um apontamento de maquina por ID
   */
  @RequirePermission('apontamentoMaquinas.read')
  @Cacheable('apontamentoMaquinas:getById', 3600)
  async getById(id: number | string): Promise<ApontamentoMaquinasResponseDto | null> {
    const apontamentoMaquinas = await this.apontamentoMaquinasRepository.findById(id);
    return apontamentoMaquinas ? this.mapper.toDto(apontamentoMaquinas) : null;
  }

  /**
   * Cria um novo apontamento de maquina
   *
   * Logica de negocio:
   * 1. Cria o registro de apontamento de maquina
   * 2. Atualiza o horimetro da maquina (horimetroApontamento e ultimoHorimetro)
   */
  @RequirePermission('apontamentoMaquinas.create')
  @Auditable('ApontamentoMaquinas')
  @CacheEvict('apontamentoMaquinas:list')
  @Transactional()
  async create(dto: CreateApontamentoMaquinasDto): Promise<ApontamentoMaquinasResponseDto> {
    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto nao disponivel');
    }

    const userId = context.getUserId();
    const tenantId = context.getTenantId();

    if (!userId || !tenantId) {
      throw new BadRequestException('Usuario nao autenticado ou tenant nao identificado');
    }

    const entityData = await this.mapper.toEntity(dto);

    (entityData as any).usercreation = userId;
    (entityData as any).tenantId = tenantId;

    const apontamentoMaquinas = await this.apontamentoMaquinasRepository.create(entityData);

    // Apos criar o apontamento de maquina, atualizar horimetro
    try {
      const maquina = await this.maquinaRepository.findById(dto.idMaquina);
      if (maquina) {
        const horasUtilizadas = Number(dto.horaFim) - Number(dto.horaInicio);
        const horimetroAtual = Number((maquina as any).horimetroApontamento) || 0;
        const novoHorimetro = horimetroAtual + horasUtilizadas;

        const updateData: any = { horimetroApontamento: novoHorimetro };
        // Atualizar ultimoHorimetro se necessario
        const ultimoHorimetro = Number((maquina as any).ultimoHorimetro) || 0;
        if (novoHorimetro > ultimoHorimetro) {
          updateData.ultimoHorimetro = novoHorimetro;
        }
        await this.maquinaRepository.update(dto.idMaquina, updateData);
      }
    } catch {
      // Nao falhar o apontamento se a atualizacao do horimetro falhar
    }

    return this.mapper.toDto(apontamentoMaquinas);
  }

  /**
   * Atualiza um apontamento de maquina existente
   */
  @RequirePermission('apontamentoMaquinas.update')
  @Auditable('ApontamentoMaquinas')
  @CacheEvict('apontamentoMaquinas:list:*', true)
  @CacheEvict('apontamentoMaquinas:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateApontamentoMaquinasDto): Promise<ApontamentoMaquinasResponseDto> {
    const apontamentoMaquinas = await this.apontamentoMaquinasRepository.findById(id);
    if (!apontamentoMaquinas) {
      throw new NotFoundException('Apontamento de maquina nao encontrado');
    }

    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.apontamentoMaquinasRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um apontamento de maquina
   */
  @RequirePermission('apontamentoMaquinas.delete')
  @Auditable('ApontamentoMaquinas')
  @CacheEvict('apontamentoMaquinas:list:*', true)
  @CacheEvict('apontamentoMaquinas:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const apontamentoMaquinas = await this.apontamentoMaquinasRepository.findById(id);
    if (!apontamentoMaquinas) {
      return false;
    }

    await this.apontamentoMaquinasRepository.delete(id);
    return true;
  }
}
