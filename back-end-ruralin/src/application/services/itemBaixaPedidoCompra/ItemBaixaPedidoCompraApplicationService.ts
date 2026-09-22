import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IItemBaixaPedidoCompraApplicationService } from './IItemBaixaPedidoCompraApplicationService';
import { IItemBaixaPedidoCompraRepository } from '../../../infrastructure/repository/IItemBaixaPedidoCompraRepository';
import { IBaixaPedidoCompraRepository } from '../../../infrastructure/repository/IBaixaPedidoCompraRepository';
import { IItemPedidoCompraRepository } from '../../../infrastructure/repository/IItemPedidoCompraRepository';
import { CreateItemBaixaPedidoCompraDto } from '../../dto/itemBaixaPedidoCompra/CreateItemBaixaPedidoCompraDto';
import { UpdateItemBaixaPedidoCompraDto } from '../../dto/itemBaixaPedidoCompra/UpdateItemBaixaPedidoCompraDto';
import { ItemBaixaPedidoCompraResponseDto } from '../../dto/itemBaixaPedidoCompra/ItemBaixaPedidoCompraResponseDto';
import { ItemBaixaPedidoCompraMapper } from '../../mappers/ItemBaixaPedidoCompraMapper';
import { StatusBaixaPedidoCompra } from '../../../models/enums/PedidoCompraEnums';
import { Auditable } from '../../../core/audit';
import { CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BadRequestException } from '../../../core/exceptions/BadRequestException';
import { BusinessException } from '../../../core/exceptions/BusinessException';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para ItemBaixaPedidoCompra
 *
 * Implementa a logica de negocio para operacoes de itens de baixa de pedido de compra.
 */
@Injectable()
export class ItemBaixaPedidoCompraApplicationService implements IItemBaixaPedidoCompraApplicationService {
  constructor(
    @Inject(TYPES.IItemBaixaPedidoCompraRepository) private itemBaixaPedidoCompraRepository: IItemBaixaPedidoCompraRepository,
    @Inject(TYPES.IBaixaPedidoCompraRepository) private baixaPedidoCompraRepository: IBaixaPedidoCompraRepository,
    @Inject(TYPES.IItemPedidoCompraRepository) private itemPedidoCompraRepository: IItemPedidoCompraRepository,
    private itemBaixaPedidoCompraMapper: ItemBaixaPedidoCompraMapper
  ) {}

  /**
   * Lista todos os itens com paginacao
   */
  @RequirePermission('baixa_pedido_compra.read')
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<ItemBaixaPedidoCompraResponseDto>> {
    const result = await this.itemBaixaPedidoCompraRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.itemBaixaPedidoCompraMapper.toDto(item)),
    };
  }

  /**
   * Busca um item por ID
   */
  @RequirePermission('baixa_pedido_compra.read')
  async getById(id: number): Promise<ItemBaixaPedidoCompraResponseDto | null> {
    const item = await this.itemBaixaPedidoCompraRepository.findById(id);
    if (!item) {
      return null;
    }
    return this.itemBaixaPedidoCompraMapper.toDto(item);
  }

  /**
   * Cria um novo item de baixa de pedido de compra
   */
  @RequirePermission('baixa_pedido_compra.create')
  @Auditable('ItemBaixaPedidoCompra')
  @CacheEvict('baixa_pedido_compra:*')
  @Transactional()
  async create(dto: CreateItemBaixaPedidoCompraDto): Promise<ItemBaixaPedidoCompraResponseDto> {
    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto nao disponivel');
    }

    const userId = context.getUserId();
    const tenantId = context.getTenantId();

    // Validar baixa existe e esta pendente
    const baixa = await this.baixaPedidoCompraRepository.findById(dto.baixaPedidoCompraId);
    if (!baixa) {
      throw new NotFoundException('Baixa de pedido de compra', String(dto.baixaPedidoCompraId));
    }
    if (baixa.status !== StatusBaixaPedidoCompra.PENDENTE) {
      throw new BusinessException('Somente baixas com status pendente podem receber novos itens');
    }

    // Validar item do pedido existe
    const itemPedido = await this.itemPedidoCompraRepository.findById(dto.itemPedidoCompraId);
    if (!itemPedido) {
      throw new NotFoundException('Item do pedido de compra', String(dto.itemPedidoCompraId));
    }

    const entity = await this.itemBaixaPedidoCompraMapper.toEntity(dto);

    // Calcular divergencia de preco
    const vlUnitarioPedido = Number(itemPedido.vl_unitario) || 0;
    const vlUnitarioNf = Number(dto.vl_unitario_nf) || 0;
    (entity as any).vl_unitario_pedido = vlUnitarioPedido;
    (entity as any).vl_divergencia = Number((vlUnitarioNf - vlUnitarioPedido).toFixed(2));

    if (tenantId) {
      (entity as any).tenantId = tenantId;
    }
    if (userId) {
      (entity as any).usercreation = userId;
    }

    const created = await this.itemBaixaPedidoCompraRepository.create(entity);
    const result = await this.itemBaixaPedidoCompraRepository.findById(created.id_item_baixa_ped);
    return this.itemBaixaPedidoCompraMapper.toDto(result!);
  }

  /**
   * Atualiza um item de baixa de pedido de compra
   */
  @RequirePermission('baixa_pedido_compra.create')
  @Auditable('ItemBaixaPedidoCompra')
  @CacheEvict('baixa_pedido_compra:*')
  @Transactional()
  async update(id: number, dto: UpdateItemBaixaPedidoCompraDto): Promise<ItemBaixaPedidoCompraResponseDto> {
    const existing = await this.itemBaixaPedidoCompraRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Item de baixa de pedido de compra', String(id));
    }

    // Validar baixa pai esta pendente
    const baixaId = existing.baixaPedidoCompraId;
    const baixa = await this.baixaPedidoCompraRepository.findById(baixaId);
    if (baixa && baixa.status !== StatusBaixaPedidoCompra.PENDENTE) {
      throw new BusinessException('Somente itens de baixas com status pendente podem ser atualizados');
    }

    const entity = await this.itemBaixaPedidoCompraMapper.toEntity(dto);
    const updated = await this.itemBaixaPedidoCompraRepository.update(id, entity);
    return this.itemBaixaPedidoCompraMapper.toDto(updated);
  }

  /**
   * Deleta um item de baixa de pedido de compra
   */
  @RequirePermission('baixa_pedido_compra.create')
  @Auditable('ItemBaixaPedidoCompra')
  @CacheEvict('baixa_pedido_compra:*')
  @Transactional()
  async delete(id: number): Promise<boolean> {
    const existing = await this.itemBaixaPedidoCompraRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Item de baixa de pedido de compra', String(id));
    }

    // Validar baixa pai esta pendente
    const baixaId = existing.baixaPedidoCompraId;
    const baixa = await this.baixaPedidoCompraRepository.findById(baixaId);
    if (baixa && baixa.status !== StatusBaixaPedidoCompra.PENDENTE) {
      throw new BusinessException('Somente itens de baixas com status pendente podem ser excluidos');
    }

    return await this.itemBaixaPedidoCompraRepository.delete(id);
  }

  /**
   * Lista todos os itens de uma baixa
   */
  @RequirePermission('baixa_pedido_compra.read')
  async findByBaixaPedidoCompra(baixaPedidoCompraId: number): Promise<ItemBaixaPedidoCompraResponseDto[]> {
    const itens = await this.itemBaixaPedidoCompraRepository.findByBaixa(baixaPedidoCompraId);
    return itens.map((i: any) => this.itemBaixaPedidoCompraMapper.toDto(i));
  }

  /**
   * Lista itens por item do pedido de compra
   */
  @RequirePermission('baixa_pedido_compra.read')
  async findByItemPedidoCompra(itemPedidoCompraId: number): Promise<ItemBaixaPedidoCompraResponseDto[]> {
    const itens = await this.itemBaixaPedidoCompraRepository.findByItemPedido(itemPedidoCompraId);
    return itens.map((i: any) => this.itemBaixaPedidoCompraMapper.toDto(i));
  }
}
