import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IUnidadeDepositoApplicationService } from './IUnidadeDepositoApplicationService';
import { IUnidadeDepositoRepository } from '../../../infrastructure/repository/IUnidadeDepositoRepository';
import { IProdutoRepository } from '../../../infrastructure/repository/IProdutoRepository';
import { IUnidadeMedidaRepository } from '../../../infrastructure/repository/IUnidadeMedidaRepository';
import { CreateUnidadeDepositoDto } from '../../dto/unidadeDeposito/CreateUnidadeDepositoDto';
import { UpdateUnidadeDepositoDto } from '../../dto/unidadeDeposito/UpdateUnidadeDepositoDto';
import { UnidadeDepositoResponseDto } from '../../dto/unidadeDeposito/UnidadeDepositoResponseDto';
import { UnidadeDepositoComSaldoDto } from '../../dto/unidadeDeposito/UnidadeDepositoComSaldoDto';
import { UnidadeDepositoMapper } from '../../mappers/UnidadeDepositoMapper';
import { Auditable } from '../../../core/audit';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, ForbiddenException, BusinessException } from '../../../core/exceptions';
import { getRequestContext } from '../../../core/authorization/helpers';
import sequelize from '../../../config/database';
import { QueryTypes } from 'sequelize';

/**
 * Application Service para UnidadeDeposito
 */
@Injectable()
export class UnidadeDepositoApplicationService implements IUnidadeDepositoApplicationService {
  constructor(
    @Inject(TYPES.IUnidadeDepositoRepository) private unidadeDepositoRepository: IUnidadeDepositoRepository,
    @Inject(TYPES.IProdutoRepository) private produtoRepository: IProdutoRepository,
    @Inject(TYPES.IUnidadeMedidaRepository) private unidadeMedidaRepository: IUnidadeMedidaRepository,
    private mapper: UnidadeDepositoMapper
  ) {}

  @RequirePermission('unidadeDeposito.read')
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<UnidadeDepositoResponseDto>> {
    const result = await this.unidadeDepositoRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  @RequirePermission('unidadeDeposito.read')
  async getById(id: number | string): Promise<UnidadeDepositoResponseDto | null> {
    const unidadeDeposito = await this.unidadeDepositoRepository.findById(id);
    return unidadeDeposito ? this.mapper.toDto(unidadeDeposito) : null;
  }

  @RequirePermission('unidadeDeposito.read')
  async findByProduto(idProduto: number): Promise<UnidadeDepositoResponseDto[]> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId() || 0;
    const unidades = await this.unidadeDepositoRepository.findByProduto(idProduto, tenantId);
    return unidades.map(item => this.mapper.toDto(item));
  }

  @RequirePermission('unidadeDeposito.read')
  async findComSaldo(): Promise<UnidadeDepositoComSaldoDto[]> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId() || 0;
    const result = await this.unidadeDepositoRepository.findComSaldo(tenantId);
    return result.map(item => this.mapper.toComSaldoDto(item));
  }

  @RequirePermission('unidadeDeposito.create')
  @Auditable('UnidadeDeposito')
  @Transactional()
  async create(dto: CreateUnidadeDepositoDto): Promise<UnidadeDepositoResponseDto> {
    const context = getRequestContext();
    if (!context || !context.getUserId() || !context.getTenantId()) {
      throw new ForbiddenException(
        'Usuário não autenticado ou tenant não identificado.',
        'USER_NOT_AUTHENTICATED'
      );
    }
    const userId = context.getUserId()!;
    const tenantId = context.getTenantId()!;

    // Validar cross-tenant: Produto deve pertencer ao mesmo tenant
    const produto = await this.produtoRepository.findById(dto.idProduto);
    if (!produto) {
      throw new NotFoundException('Produto não encontrado ou não pertence ao tenant atual');
    }

    // Validar cross-tenant: UnidadeMedida deve pertencer ao mesmo tenant
    const unidadeMedida = await this.unidadeMedidaRepository.findById(dto.idUnidadeMedida);
    if (!unidadeMedida) {
      throw new NotFoundException('Unidade de medida não encontrada ou não pertence ao tenant atual');
    }

    const entityData = await this.mapper.toEntity(dto);

    const entityWithAudit = {
      ...entityData,
      usercreation: userId,
      datecreation: new Date(),
    };

    const unidadeDeposito = await this.unidadeDepositoRepository.create(entityWithAudit);
    return this.mapper.toDto(unidadeDeposito);
  }

  @RequirePermission('unidadeDeposito.update')
  @Auditable('UnidadeDeposito')
  @Transactional()
  async update(id: number | string, dto: UpdateUnidadeDepositoDto): Promise<UnidadeDepositoResponseDto> {
    const unidadeDeposito = await this.unidadeDepositoRepository.findById(id);
    if (!unidadeDeposito) {
      throw new NotFoundException('Unidade de depósito não encontrada');
    }

    const context = getRequestContext();
    if (!context || !context.getTenantId()) {
      throw new ForbiddenException('Tenant não identificado');
    }

    // Validar cross-tenant apenas se idProduto estiver sendo atualizado
    if (dto.idProduto !== undefined) {
      const produto = await this.produtoRepository.findById(dto.idProduto);
      if (!produto) {
        throw new NotFoundException('Produto não encontrado ou não pertence ao tenant atual');
      }
    }

    // Validar cross-tenant apenas se idUnidadeMedida estiver sendo atualizado
    if (dto.idUnidadeMedida !== undefined) {
      const unidadeMedida = await this.unidadeMedidaRepository.findById(dto.idUnidadeMedida);
      if (!unidadeMedida) {
        throw new NotFoundException('Unidade de medida não encontrada ou não pertence ao tenant atual');
      }
    }

    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.unidadeDepositoRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  @RequirePermission('unidadeDeposito.delete')
  @Auditable('UnidadeDeposito')
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const unidadeDeposito = await this.unidadeDepositoRepository.findById(id);
    if (!unidadeDeposito) {
      return false;
    }

    // Verificar se existem registros de armazenagem vinculados
    try {
      const registros = await sequelize.query(
        `SELECT COUNT(*) as total FROM C053_registroArmazenagem WHERE idUnidadeDeposito = :id AND tenantId = :tenantId`,
        {
          replacements: { id, tenantId: unidadeDeposito.tenantId },
          type: QueryTypes.SELECT,
        }
      );

      const total = (registros[0] as any)?.total || 0;
      if (Number(total) > 0) {
        throw new BusinessException(
          'Não é possível excluir a unidade de depósito pois existem registros de armazenagem vinculados.',
          'UNIDADE_DEPOSITO_COM_REGISTROS'
        );
      }
    } catch (error) {
      // Se a tabela C053_registroArmazenagem não existir, ignora a verificação
      if (error instanceof BusinessException) {
        throw error;
      }
      // Tabela não existe ainda, pode prosseguir com a exclusão
    }

    await this.unidadeDepositoRepository.delete(id);
    return true;
  }
}
