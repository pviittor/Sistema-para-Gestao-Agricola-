/**
 * FinanceiroApplicationService - Application Service para entidade Financeiro
 * 
 * Contém a lógica de negócio para operações com registros financeiros, separando
 * controllers (HTTP) da lógica de aplicação.
 * 
 * Responsabilidades:
 * - Validações de negócio
 * - Regras de negócio (validações de valores, datas)
 * - Orquestração de repositórios e mappers
 * - Transformações de dados
 * 
 * @example
 * ```typescript
 * const service = container.resolve<IFinanceiroApplicationService>(TYPES.IFinanceiroApplicationService);
 * 
 * const registro = await service.create({
 *   dataEmissao: '2025-01-20',
 *   dataVencimento: '2025-01-25',
 *   valor: 1500.50,
 *   // ...
 * });
 * ```
 */

import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IFinanceiroApplicationService } from './IFinanceiroApplicationService';
import { IFinanceiroRepository } from '../../../infrastructure/repository/IFinanceiroRepository';
import { FinanceiroMapper } from '../../mappers/FinanceiroMapper';
import { CreateFinanceiroDto } from '../../dto/financeiro/CreateFinanceiroDto';
import { UpdateFinanceiroDto } from '../../dto/financeiro/UpdateFinanceiroDto';
import { FinanceiroResponseDto } from '../../dto/financeiro/FinanceiroResponseDto';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, BusinessException } from '../../../core/exceptions';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { RequirePermission } from '../../../core/authorization';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';

/**
 * Application Service para entidade Financeiro
 * 
 * Implementa lógica de negócio para operações com registros financeiros, usando
 * repositório para acesso a dados e mapper para conversão DTO-Entidade.
 */
@Injectable()
export class FinanceiroApplicationService implements IFinanceiroApplicationService {
  private mapper: FinanceiroMapper;

  constructor(
    @Inject(TYPES.IFinanceiroRepository)
    private repository: IFinanceiroRepository
  ) {
    // Criar instância do mapper (pode ser injetado no futuro se necessário)
    this.mapper = new FinanceiroMapper();
  }

  /**
   * Cria um novo registro financeiro
   * 
   * @param dto - DTO com dados para criação
   * @returns Promise que resolve com o DTO do registro criado
   * @throws BusinessException se validações de negócio falharem
   * @throws ForbiddenException se usuário não tiver permissão 'financeiro.create'
   */
  @RequirePermission('financeiro.create')
  @Transactional()
  @Auditable('Financeiro')
  @CacheEvict('financeiro:list:*', true)
  @CacheEvict('financeiro:findByPeriodo:*', true)
  @CacheEvict('financeiro:findByTipo:*', true)
  async create(dto: CreateFinanceiroDto): Promise<FinanceiroResponseDto> {
    // Validação de negócio: verificar se data de vencimento é posterior ou igual à data de emissão
    // (já validado no DTO, mas reforçamos aqui)
    const dataEmissao = new Date(dto.dataEmissao);
    const dataVencimento = new Date(dto.dataVencimento);
    
    if (dataVencimento < dataEmissao) {
      throw new BusinessException('Data de vencimento deve ser posterior ou igual à data de emissão');
    }

    // Validação de negócio: verificar se valor não é zero
    if (dto.valor === 0) {
      throw new BusinessException('Valor não pode ser zero');
    }

    // Converter DTO para entidade
    const entity = await this.mapper.toEntity(dto);

    // Criar via repositório
    const created = await this.repository.create(entity as any);

    // Retornar como DTO
    return this.mapper.toDto(created);
  }

  /**
   * Atualiza um registro financeiro existente
   * 
   * @param id - ID do registro
   * @param dto - DTO com dados para atualização
   * @returns Promise que resolve com o DTO do registro atualizado
   * @throws NotFoundException se registro não for encontrado
   * @throws BusinessException se validações de negócio falharem
   * @throws ForbiddenException se usuário não tiver permissão 'financeiro.update'
   */
  @RequirePermission('financeiro.update')
  @Transactional()
  @Auditable('Financeiro')
  @CacheEvict('financeiro:getById:{0}')
  @CacheEvict('financeiro:list:*', true)
  @CacheEvict('financeiro:findByPeriodo:*', true)
  @CacheEvict('financeiro:findByTipo:*', true)
  async update(id: number | string, dto: UpdateFinanceiroDto): Promise<FinanceiroResponseDto> {
    // Verificar se registro existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Registro financeiro', id);
    }

    // Validação de negócio: verificar datas (se fornecidas)
    if (dto.dataEmissao && dto.dataVencimento) {
      const dataEmissao = new Date(dto.dataEmissao);
      const dataVencimento = new Date(dto.dataVencimento);
      
      if (dataVencimento < dataEmissao) {
        throw new BusinessException('Data de vencimento deve ser posterior ou igual à data de emissão');
      }
    } else if (dto.dataVencimento) {
      // Se apenas dataVencimento for fornecida, comparar com dataEmissao existente
      const dataEmissao = new Date(existing.dataEmissao);
      const dataVencimento = new Date(dto.dataVencimento);
      
      if (dataVencimento < dataEmissao) {
        throw new BusinessException('Data de vencimento deve ser posterior ou igual à data de emissão');
      }
    }

    // Validação de negócio: verificar se valor não é zero (se fornecido)
    if (dto.valor !== undefined && dto.valor === 0) {
      throw new BusinessException('Valor não pode ser zero');
    }

    // Converter DTO para entidade
    const entity = await this.mapper.toEntity(dto);

    // Atualizar via repositório
    const updated = await this.repository.update(id, entity as any);

    // Retornar como DTO
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um registro financeiro
   * 
   * @param id - ID do registro
   * @returns Promise que resolve com true se removido, false caso contrário
   * @throws ForbiddenException se usuário não tiver permissão 'financeiro.delete'
   */
  @RequirePermission('financeiro.delete')
  @Transactional()
  @Auditable('Financeiro')
  @CacheEvict('financeiro:getById:{0}')
  @CacheEvict('financeiro:list:*', true)
  @CacheEvict('financeiro:findByPeriodo:*', true)
  @CacheEvict('financeiro:findByTipo:*', true)
  async delete(id: number | string): Promise<boolean> {
    // Verificar se registro existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      return false;
    }

    // Remover via repositório
    return await this.repository.delete(id);
  }

  /**
   * Busca um registro financeiro por ID
   * 
   * @param id - ID do registro
   * @returns Promise que resolve com o DTO do registro encontrado ou null
   * @throws ForbiddenException se usuário não tiver permissão 'financeiro.read'
   */
  @RequirePermission('financeiro.read')
  @Cacheable('financeiro:getById:{0}', 3600)
  async getById(id: number | string): Promise<FinanceiroResponseDto | null> {
    const entity = await this.repository.findById(id);
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Lista registros financeiros com paginação
   * 
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado
   * @throws ForbiddenException se usuário não tiver permissão 'financeiro.read'
   */
  @RequirePermission('financeiro.read')
  @Cacheable('financeiro:list:{0}:{1}', 300)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<FinanceiroResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(entity => this.mapper.toDto(entity)),
    };
  }

  /**
   * Busca registros financeiros por período de datas
   * 
   * @param dataInicio - Data de início do período (inclusive)
   * @param dataFim - Data de fim do período (inclusive)
   * @returns Promise que resolve com array de DTOs de registros financeiros no período
   * @throws ForbiddenException se usuário não tiver permissão 'financeiro.read'
   */
  @RequirePermission('financeiro.read')
  @Cacheable('financeiro:findByPeriodo:{0}:{1}', 300)
  async findByPeriodo(dataInicio: Date | string, dataFim: Date | string): Promise<FinanceiroResponseDto[]> {
    const entities = await this.repository.findByPeriodo(dataInicio, dataFim);
    return entities.map(entity => this.mapper.toDto(entity));
  }

  /**
   * Busca registros financeiros por tipo
   * 
   * @param tipo - Tipo do registro financeiro ('RECEITA' ou 'DESPESA')
   * @returns Promise que resolve com array de DTOs de registros financeiros do tipo
   * @throws ForbiddenException se usuário não tiver permissão 'financeiro.read'
   */
  @RequirePermission('financeiro.read')
  @Cacheable('financeiro:findByTipo:{0}', 300)
  async findByTipo(tipo: 'RECEITA' | 'DESPESA'): Promise<FinanceiroResponseDto[]> {
    const entities = await this.repository.findByTipo(tipo);
    return entities.map(entity => this.mapper.toDto(entity));
  }
}
