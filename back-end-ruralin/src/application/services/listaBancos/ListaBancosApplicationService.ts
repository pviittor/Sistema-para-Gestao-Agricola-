import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IListaBancosApplicationService } from './IListaBancosApplicationService';
import { IListaBancosRepository } from '../../../infrastructure/repository/IListaBancosRepository';
import { CreateListaBancosDto } from '../../dto/listaBancos/CreateListaBancosDto';
import { UpdateListaBancosDto } from '../../dto/listaBancos/UpdateListaBancosDto';
import { ListaBancosResponseDto } from '../../dto/listaBancos/ListaBancosResponseDto';
import { ListaBancosMapper } from '../../mappers/ListaBancosMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequireRole } from '../../../core/authorization/RequireRole';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions';

/**
 * Application Service para ListaBancos
 * 
 * Dados globais - não vinculados a tenant
 * - Listagem disponível para todos autenticados
 * - Manutenção (create/update/delete) apenas para GOD
 */
@Injectable()
export class ListaBancosApplicationService implements IListaBancosApplicationService {
  constructor(
    @Inject(TYPES.IListaBancosRepository) private repository: IListaBancosRepository,
    @Inject(ListaBancosMapper) private mapper: ListaBancosMapper
  ) {}

  @Cacheable('listaBancos:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<ListaBancosResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  @Cacheable('listaBancos:getById:{0}', 3600)
  async getById(id: number | string): Promise<ListaBancosResponseDto | null> {
    const entity = await this.repository.findById(id);
    return entity ? this.mapper.toDto(entity) : null;
  }

  @RequireRole('GOD')
  @Auditable('ListaBancos')
  @CacheEvict('listaBancos:list:*', true)
  @Transactional()
  async create(dto: CreateListaBancosDto): Promise<ListaBancosResponseDto> {
    const entityData = await this.mapper.toEntity(dto);
    const created = await this.repository.create(entityData);
    return this.mapper.toDto(created);
  }

  @RequireRole('GOD')
  @Auditable('ListaBancos')
  @CacheEvict('listaBancos:list:*', true)
  @CacheEvict('listaBancos:getById:{0}', true)
  @Transactional()
  async update(id: number | string, dto: UpdateListaBancosDto): Promise<ListaBancosResponseDto> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Banco não encontrado');
    }
    
    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.repository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  @RequireRole('GOD')
  @Auditable('ListaBancos')
  @CacheEvict('listaBancos:list:*', true)
  @CacheEvict('listaBancos:getById:{0}', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return false;
    }
    
    await this.repository.delete(id);
    return true;
  }
}
