import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { ICentroCustoApplicationService } from './ICentroCustoApplicationService';
import { ICentroCustoRepository } from '../../../infrastructure/repository/ICentroCustoRepository';
import { CentroCustoMapper } from '../../mappers/CentroCustoMapper';
import { CreateCentroCustoDto, UpdateCentroCustoDto, CentroCustoResponseDto } from '../../dto/centroCusto';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, BadRequestException, ForbiddenException } from '../../../core/exceptions';
import { RequirePermission } from '../../../core/authorization';
import { getRequestContext } from '../../../core/authorization/helpers';
import CentroCusto from '../../../models/CentroCusto';

/**
 * Application Service para CentroCusto
 */
@Injectable()
export class CentroCustoApplicationService implements ICentroCustoApplicationService {
  constructor(
    @Inject(TYPES.ICentroCustoRepository) private repository: ICentroCustoRepository,
    @Inject(CentroCustoMapper) private mapper: CentroCustoMapper
  ) {}

  /**
   * Verifica se há ciclo circular na hierarquia
   */
  private async verificarCicloCircular(
    centroCustoId: number,
    centroCustoPaiId: number | null | undefined
  ): Promise<void> {
    if (!centroCustoPaiId) {
      return; // Sem pai, não há ciclo
    }

    if (centroCustoPaiId === centroCustoId) {
      throw new BadRequestException('Um centro de custo não pode ser pai de si mesmo');
    }

    // Verificar recursivamente se o pai é descendente do centro de custo atual
    // Usar findByIdWithoutTenant para buscar sem filtro de tenant (validação de ciclo precisa ver toda a hierarquia)
    let paiAtual: CentroCusto | null = await this.repository.findByIdWithoutTenant(centroCustoPaiId);
    const visitados = new Set<number>();

    while (paiAtual) {
      if (visitados.has(paiAtual.id)) {
        throw new BadRequestException('Ciclo circular detectado na hierarquia');
      }

      if (paiAtual.id === centroCustoId) {
        throw new BadRequestException('Ciclo circular detectado: o centro de custo pai é descendente do centro de custo atual');
      }

      visitados.add(paiAtual.id);

      if (!paiAtual.centroCustoPaiId) {
        break; // Chegou ao topo da hierarquia
      }

      paiAtual = await this.repository.findByIdWithoutTenant(paiAtual.centroCustoPaiId);
    }
  }

  /**
   * Lista todos os centros de custo paginados
   */
  @RequirePermission('centroCusto.read')
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<CentroCustoResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map((item: CentroCusto) => this.mapper.toDto(item)),
    };
  }

  /**
   * Lista todos os centros de custo sem paginação
   */
  @RequirePermission('centroCusto.read')
  async listAll(): Promise<CentroCustoResponseDto[]> {
    const centrosCusto = await this.repository.findAll();
    return centrosCusto.map((centroCusto) => this.mapper.toDto(centroCusto));
  }

  /**
   * Busca um centro de custo por ID
   */
  @RequirePermission('centroCusto.read')
  async show(id: number): Promise<CentroCustoResponseDto> {
    const centroCusto = await this.repository.findById(id);
    if (!centroCusto) {
      throw new NotFoundException('Centro de custo não encontrado');
    }
    return this.mapper.toDto(centroCusto);
  }

  /**
   * Busca centros de custo filhos de um pai específico
   */
  @RequirePermission('centroCusto.read')
  async findByPai(centroCustoPaiId: number): Promise<CentroCustoResponseDto[]> {
    // Verificar se o pai existe e pertence ao mesmo tenant
    const pai = await this.repository.findById(centroCustoPaiId);
    if (!pai) {
      throw new NotFoundException('Centro de custo pai não encontrado');
    }

    const filhos = await this.repository.findByPai(centroCustoPaiId);
    return filhos.map((filho) => this.mapper.toDto(filho));
  }

  /**
   * Cria um novo centro de custo
   */
  @RequirePermission('centroCusto.create')
  async create(dto: CreateCentroCustoDto): Promise<CentroCustoResponseDto> {
    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto não disponível');
    }

    const userId = context.getUserId();
    const tenantId = context.getTenantId();

    if (!userId || !tenantId) {
      throw new BadRequestException('Usuário não autenticado ou tenant não identificado');
    }

    // Validar cross-tenant: se centroCustoPaiId for fornecido, verificar se pertence ao mesmo tenant
    if (dto.centroCustoPaiId) {
      const pai = await this.repository.findById(dto.centroCustoPaiId);
      if (!pai) {
        throw new NotFoundException('Centro de custo pai não encontrado');
      }
      if (pai.tenantId !== tenantId) {
        throw new ForbiddenException('Centro de custo pai não pertence ao mesmo tenant');
      }

      // Verificar ciclo circular
      await this.verificarCicloCircular(0, dto.centroCustoPaiId);
    }

    const entity = this.mapper.toEntity(dto, userId, tenantId);
    const created = await this.repository.create(entity);
    return this.mapper.toDto(created);
  }

  /**
   * Atualiza um centro de custo
   */
  @RequirePermission('centroCusto.update')
  async update(id: number, dto: UpdateCentroCustoDto): Promise<CentroCustoResponseDto> {
    const centroCusto = await this.repository.findById(id);
    if (!centroCusto) {
      throw new NotFoundException('Centro de custo não encontrado');
    }

    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto não disponível');
    }

    const tenantId = context.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant não identificado');
    }

    // Validar cross-tenant: se centroCustoPaiId for fornecido, verificar se pertence ao mesmo tenant
    if (dto.centroCustoPaiId !== undefined) {
      if (dto.centroCustoPaiId === null) {
        // Permitir remover o pai
      } else {
        const pai = await this.repository.findById(dto.centroCustoPaiId);
        if (!pai) {
          throw new NotFoundException('Centro de custo pai não encontrado');
        }
        if (pai.tenantId !== tenantId) {
          throw new ForbiddenException('Centro de custo pai não pertence ao mesmo tenant');
        }

        // Verificar ciclo circular
        await this.verificarCicloCircular(id, dto.centroCustoPaiId);
      }
    }

    const updateData = this.mapper.toUpdateEntity(dto);
    const updated = await this.repository.update(id, updateData);
    return this.mapper.toDto(updated);
  }

  /**
   * Deleta um centro de custo
   */
  @RequirePermission('centroCusto.delete')
  async delete(id: number): Promise<boolean> {
    const centroCusto = await this.repository.findById(id);
    if (!centroCusto) {
      throw new NotFoundException('Centro de custo não encontrado');
    }

    // Verificar se existem centros de custo filhos
    const filhos = await this.repository.findByPai(id);
    if (filhos.length > 0) {
      throw new BadRequestException('Não é possível deletar o centro de custo pois existem centros de custo filhos vinculados');
    }

    return await this.repository.delete(id);
  }
}
