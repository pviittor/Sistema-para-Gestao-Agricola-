import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { ISafraApplicationService } from './ISafraApplicationService';
import { ISafraRepository } from '../../../infrastructure/repository/ISafraRepository';
import { ICulturaRepository } from '../../../infrastructure/repository/ICulturaRepository';
import { SafraMapper } from '../../mappers/SafraMapper';
import { CreateSafraDto, UpdateSafraDto, SafraResponseDto } from '../../dto/safra';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, BadRequestException, ForbiddenException } from '../../../core/exceptions';
import { RequirePermission } from '../../../core/authorization';
import { getRequestContext } from '../../../core/authorization/helpers';
import Safra, { StatusSafra } from '../../../models/Safra';

/**
 * Application Service para Safra
 */
@Injectable()
export class SafraApplicationService implements ISafraApplicationService {
  constructor(
    @Inject(TYPES.ISafraRepository) private repository: ISafraRepository,
    @Inject(TYPES.ICulturaRepository) private culturaRepository: ICulturaRepository,
    @Inject(SafraMapper) private mapper: SafraMapper
  ) {}

  /**
   * Valida se dataFim é posterior a dataInicio
   */
  private validarDatas(dataInicio: string, dataFim?: string | null): void {
    if (dataFim) {
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);

      if (fim < inicio) {
        throw new BadRequestException('Data de fim deve ser posterior à data de início');
      }
    }
  }

  /**
   * Lista todas as safras paginadas
   */
  @RequirePermission('safra.read')
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<SafraResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map((item: Safra) => this.mapper.toDto(item)),
    };
  }

  /**
   * Lista todas as safras sem paginação
   */
  @RequirePermission('safra.read')
  async listAll(): Promise<SafraResponseDto[]> {
    const safras = await this.repository.findAll();
    return safras.map((safra) => this.mapper.toDto(safra));
  }

  /**
   * Busca uma safra por ID
   */
  @RequirePermission('safra.read')
  async show(id: number): Promise<SafraResponseDto> {
    const safra = await this.repository.findById(id);
    if (!safra) {
      throw new NotFoundException('Safra não encontrada');
    }
    return this.mapper.toDto(safra);
  }

  /**
   * Busca safras por cultura
   */
  @RequirePermission('safra.read')
  async findByCultura(culturaId: number): Promise<SafraResponseDto[]> {
    // Verificar se a cultura existe e pertence ao mesmo tenant
    const cultura = await this.culturaRepository.findById(culturaId);
    if (!cultura) {
      throw new NotFoundException('Cultura não encontrada');
    }

    const safras = await this.repository.findByCultura(culturaId);
    return safras.map((safra) => this.mapper.toDto(safra));
  }

  /**
   * Busca safras por status
   */
  @RequirePermission('safra.read')
  async findByStatus(status: StatusSafra): Promise<SafraResponseDto[]> {
    const safras = await this.repository.findByStatus(status);
    return safras.map((safra) => this.mapper.toDto(safra));
  }

  /**
   * Cria uma nova safra
   */
  @RequirePermission('safra.create')
  async create(dto: CreateSafraDto): Promise<SafraResponseDto> {
    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto não disponível');
    }

    const userId = context.getUserId();
    const tenantId = context.getTenantId();

    if (!userId || !tenantId) {
      throw new BadRequestException('Usuário não autenticado ou tenant não identificado');
    }

    // Validar datas
    this.validarDatas(dto.dataInicio, dto.dataFim);

    // Validar cross-tenant: Cultura deve pertencer ao mesmo tenant
    const cultura = await this.culturaRepository.findById(dto.culturaId);
    if (!cultura) {
      throw new NotFoundException('Cultura não encontrada');
    }
    if (cultura.tenantId !== tenantId) {
      throw new ForbiddenException('Cultura não pertence ao mesmo tenant');
    }

    const entity = this.mapper.toEntity(dto, userId, tenantId);
    const created = await this.repository.create(entity);
    return this.mapper.toDto(created);
  }

  /**
   * Atualiza uma safra
   */
  @RequirePermission('safra.update')
  async update(id: number, dto: UpdateSafraDto): Promise<SafraResponseDto> {
    const safra = await this.repository.findById(id);
    if (!safra) {
      throw new NotFoundException('Safra não encontrada');
    }

    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto não disponível');
    }

    const tenantId = context.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant não identificado');
    }

    // Validar datas (usar dataInicio do DTO ou da entidade existente)
    const dataInicio = dto.dataInicio || safra.dataInicio.toISOString().split('T')[0];
    const dataFim = dto.dataFim !== undefined ? dto.dataFim : (safra.dataFim ? safra.dataFim.toISOString().split('T')[0] : null);
    this.validarDatas(dataInicio, dataFim);

    // Validar cross-tenant: se culturaId for fornecido, verificar se pertence ao mesmo tenant
    if (dto.culturaId !== undefined) {
      const cultura = await this.culturaRepository.findById(dto.culturaId);
      if (!cultura) {
        throw new NotFoundException('Cultura não encontrada');
      }
      if (cultura.tenantId !== tenantId) {
        throw new ForbiddenException('Cultura não pertence ao mesmo tenant');
      }
    }

    const updateData = this.mapper.toUpdateEntity(dto);
    const updated = await this.repository.update(id, updateData);
    return this.mapper.toDto(updated);
  }

  /**
   * Deleta uma safra
   */
  @RequirePermission('safra.delete')
  async delete(id: number): Promise<boolean> {
    const safra = await this.repository.findById(id);
    if (!safra) {
      throw new NotFoundException('Safra não encontrada');
    }

    return await this.repository.delete(id);
  }
}
