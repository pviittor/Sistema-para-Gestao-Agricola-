import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IItemPedidoCompraApplicationService } from './IItemPedidoCompraApplicationService';
import { IItemPedidoCompraRepository } from '../../../infrastructure/repository/IItemPedidoCompraRepository';
import { IPedidoCompraRepository } from '../../../infrastructure/repository/IPedidoCompraRepository';
import { CreateItemPedidoCompraDto } from '../../dto/itemPedidoCompra/CreateItemPedidoCompraDto';
import { UpdateItemPedidoCompraDto } from '../../dto/itemPedidoCompra/UpdateItemPedidoCompraDto';
import { ItemPedidoCompraResponseDto } from '../../dto/itemPedidoCompra/ItemPedidoCompraResponseDto';
import { ItemPedidoCompraMapper } from '../../mappers/ItemPedidoCompraMapper';
import { StatusPedidoCompra } from '../../../models/enums/PedidoCompraEnums';
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
 * Application Service para ItemPedidoCompra
 *
 * Implementa a logica de negocio para operacoes de itens de pedido de compra,
 * incluindo calculo automatico de valores e recalculo dos totais do pedido.
 */
@Injectable()
export class ItemPedidoCompraApplicationService implements IItemPedidoCompraApplicationService {
  constructor(
    @Inject(TYPES.IItemPedidoCompraRepository) private itemPedidoCompraRepository: IItemPedidoCompraRepository,
    @Inject(TYPES.IPedidoCompraRepository) private pedidoCompraRepository: IPedidoCompraRepository,
    private itemPedidoCompraMapper: ItemPedidoCompraMapper
  ) {}

  /**
   * Lista todos os itens com paginacao
   */
  @RequirePermission('item_pedido_compra.read')
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<ItemPedidoCompraResponseDto>> {
    const result = await this.itemPedidoCompraRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.itemPedidoCompraMapper.toDto(item)),
    };
  }

  /**
   * Busca um item por ID
   */
  @RequirePermission('item_pedido_compra.read')
  async getById(id: number | string): Promise<ItemPedidoCompraResponseDto | null> {
    const item = await this.itemPedidoCompraRepository.findById(id);
    return item ? this.itemPedidoCompraMapper.toDto(item) : null;
  }

  /**
   * Cria um novo item de pedido de compra
   *
   * Regras de negocio:
   * 1. Valida se o pedido existe e pertence ao mesmo tenant
   * 2. Valida se o pedido esta em status editavel
   * 3. Auto-calcula vl_bruto, vl_total e quantidade_pendente
   * 4. Valida que vl_desconto nao excede vl_bruto
   * 5. Auto-gera numero_item sequencial
   * 6. Recalcula os totais do pedido pai
   */
  @RequirePermission('item_pedido_compra.create')
  @Auditable('ItemPedidoCompra')
  @CacheEvict('pedido_compra:*')
  @Transactional()
  async create(dto: CreateItemPedidoCompraDto): Promise<ItemPedidoCompraResponseDto> {
    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto nao disponivel');
    }

    const userId = context.getUserId();
    const tenantId = context.getTenantId();

    if (!userId || !tenantId) {
      throw new BadRequestException('Usuario nao autenticado ou tenant nao identificado');
    }

    // Validar pedido de compra existe e pertence ao mesmo tenant
    const pedidoCompra = await this.pedidoCompraRepository.findById(dto.pedidoCompraId);
    if (!pedidoCompra) {
      throw new NotFoundException('Pedido de compra', String(dto.pedidoCompraId));
    }
    if (pedidoCompra.tenantId !== tenantId) {
      throw new BusinessException('Pedido de compra nao pertence ao tenant atual');
    }

    // Validar status do pedido
    this.validarStatusPedidoParaEdicao(pedidoCompra.status);

    // Auto-gerar numero_item sequencial
    const itensExistentes = await this.itemPedidoCompraRepository.findByPedidoCompra(dto.pedidoCompraId);
    const proximoNumeroItem = itensExistentes.length > 0
      ? Math.max(...itensExistentes.map(i => i.numero_item)) + 1
      : 1;

    // Calcular valores
    const quantidadeSolicitada = Number(dto.quantidade_solicitada);
    const vlUnitario = Number(dto.vl_unitario);
    const vlDesconto = Number(dto.vl_desconto || 0);

    const vlBruto = Number((quantidadeSolicitada * vlUnitario).toFixed(2));

    // Validar que desconto nao excede bruto
    if (vlDesconto > vlBruto) {
      throw new BusinessException('Valor do desconto nao pode exceder o valor bruto do item');
    }

    const vlTotal = Number((vlBruto - vlDesconto).toFixed(2));

    const entityData = await this.itemPedidoCompraMapper.toEntity(dto);
    (entityData as any).tenantId = tenantId;
    (entityData as any).usercreation = userId;
    (entityData as any).numero_item = proximoNumeroItem;
    (entityData as any).vl_bruto = vlBruto;
    (entityData as any).vl_total = vlTotal;
    (entityData as any).quantidade_pendente = quantidadeSolicitada;
    (entityData as any).quantidade_atendida = 0;

    const item = await this.itemPedidoCompraRepository.create(entityData);

    // Recalcular totais do pedido de compra
    await this.recalcularTotaisPedido(dto.pedidoCompraId);

    // Buscar item com associacoes para retorno
    const itemCompleto = await this.itemPedidoCompraRepository.findById(item.id_item_ped);
    return this.itemPedidoCompraMapper.toDto(itemCompleto || item);
  }

  /**
   * Atualiza um item de pedido de compra existente
   */
  @RequirePermission('item_pedido_compra.update')
  @Auditable('ItemPedidoCompra')
  @CacheEvict('pedido_compra:*')
  @Transactional()
  async update(id: number | string, dto: UpdateItemPedidoCompraDto): Promise<ItemPedidoCompraResponseDto> {
    const item = await this.itemPedidoCompraRepository.findById(id);
    if (!item) {
      throw new NotFoundException('Item de pedido de compra', String(id));
    }

    // Validar status do pedido
    const pedidoCompra = await this.pedidoCompraRepository.findById(item.pedidoCompraId);
    if (!pedidoCompra) {
      throw new NotFoundException('Pedido de compra', String(item.pedidoCompraId));
    }
    this.validarStatusPedidoParaEdicao(pedidoCompra.status);

    // Recalcular valores se quantidade ou vl_unitario alterados
    const quantidadeSolicitada = dto.quantidade_solicitada !== undefined ? Number(dto.quantidade_solicitada) : Number(item.quantidade_solicitada);
    const vlUnitario = dto.vl_unitario !== undefined ? Number(dto.vl_unitario) : Number(item.vl_unitario);
    const vlDesconto = dto.vl_desconto !== undefined ? Number(dto.vl_desconto) : Number(item.vl_desconto);

    const vlBruto = Number((quantidadeSolicitada * vlUnitario).toFixed(2));

    // Validar que desconto nao excede bruto
    if (vlDesconto > vlBruto) {
      throw new BusinessException('Valor do desconto nao pode exceder o valor bruto do item');
    }

    const vlTotal = Number((vlBruto - vlDesconto).toFixed(2));

    // Recalcular quantidade_pendente
    const quantidadeAtendida = Number(item.quantidade_atendida) || 0;
    const quantidadePendente = Math.max(0, quantidadeSolicitada - quantidadeAtendida);

    const entityData = await this.itemPedidoCompraMapper.toEntity(dto);
    (entityData as any).vl_bruto = vlBruto;
    (entityData as any).vl_total = vlTotal;
    (entityData as any).quantidade_pendente = quantidadePendente;

    const updated = await this.itemPedidoCompraRepository.update(id, entityData);

    // Recalcular totais do pedido de compra
    await this.recalcularTotaisPedido(item.pedidoCompraId);

    // Buscar item com associacoes para retorno
    const itemCompleto = await this.itemPedidoCompraRepository.findById(updated.id_item_ped);
    return this.itemPedidoCompraMapper.toDto(itemCompleto || updated);
  }

  /**
   * Remove um item de pedido de compra
   */
  @RequirePermission('item_pedido_compra.delete')
  @Auditable('ItemPedidoCompra')
  @CacheEvict('pedido_compra:*')
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const item = await this.itemPedidoCompraRepository.findById(id);
    if (!item) {
      return false;
    }

    // Validar status do pedido
    const pedidoCompra = await this.pedidoCompraRepository.findById(item.pedidoCompraId);
    if (!pedidoCompra) {
      throw new NotFoundException('Pedido de compra', String(item.pedidoCompraId));
    }
    this.validarStatusPedidoParaEdicao(pedidoCompra.status);

    const pedidoCompraId = item.pedidoCompraId;

    await this.itemPedidoCompraRepository.delete(id);

    // Recalcular totais do pedido de compra
    await this.recalcularTotaisPedido(pedidoCompraId);

    return true;
  }

  /**
   * Lista todos os itens de um pedido de compra
   */
  @RequirePermission('item_pedido_compra.read')
  async findByPedidoCompra(pedidoCompraId: number): Promise<ItemPedidoCompraResponseDto[]> {
    const itens = await this.itemPedidoCompraRepository.findByPedidoCompra(pedidoCompraId);
    return itens.map(item => this.itemPedidoCompraMapper.toDto(item));
  }

  /**
   * Lista itens pendentes de um pedido de compra
   */
  @RequirePermission('item_pedido_compra.read')
  async findPendentesByPedido(pedidoCompraId: number): Promise<ItemPedidoCompraResponseDto[]> {
    const itens = await this.itemPedidoCompraRepository.findPendentesByPedido(pedidoCompraId);
    return itens.map(item => this.itemPedidoCompraMapper.toDto(item));
  }

  /**
   * Busca itens por produto
   */
  @RequirePermission('item_pedido_compra.read')
  async findByProduto(produtoId: number): Promise<ItemPedidoCompraResponseDto[]> {
    const itens = await this.itemPedidoCompraRepository.findByProduto(produtoId);
    return itens.map(item => this.itemPedidoCompraMapper.toDto(item));
  }

  /**
   * Consolida quantidade e valor comprado por produto em um periodo
   */
  @RequirePermission('item_pedido_compra.read')
  async totalCompradoPorProduto(produtoId: number, dataInicio: string, dataFim: string): Promise<{ qtd: number; vlTotal: number }> {
    return await this.itemPedidoCompraRepository.totalCompradoPorProduto(produtoId, dataInicio, dataFim);
  }

  /**
   * Valida se o status do pedido permite edicao de itens
   */
  private validarStatusPedidoParaEdicao(status: string): void {
    const statusPermitidos = [StatusPedidoCompra.RASCUNHO, StatusPedidoCompra.AGUARDANDO_APROVACAO, StatusPedidoCompra.APROVADO];
    if (!statusPermitidos.includes(status as StatusPedidoCompra)) {
      throw new BusinessException(
        `Itens so podem ser adicionados/editados/removidos quando o pedido esta com status rascunho, aguardando aprovacao ou aprovado. Status atual: ${status}`
      );
    }
  }

  /**
   * Recalcula os totais do pedido com base nos itens
   */
  private async recalcularTotaisPedido(pedidoCompraId: number): Promise<void> {
    const itens = await this.itemPedidoCompraRepository.findByPedidoCompra(pedidoCompraId);
    const pedido = await this.pedidoCompraRepository.findById(pedidoCompraId);
    if (!pedido) return;

    let vlProdutos = 0;

    for (const item of itens) {
      vlProdutos += Number(item.vl_bruto) || 0;
    }

    const vlFrete = Number(pedido.vl_frete) || 0;
    const vlSeguro = Number(pedido.vl_seguro) || 0;
    const vlOutros = Number(pedido.vl_outros) || 0;
    const vlDesconto = Number(pedido.vl_desconto) || 0;
    const vlTotal = Number((vlProdutos + vlFrete + vlSeguro + vlOutros - vlDesconto).toFixed(2));

    await this.pedidoCompraRepository.update(pedidoCompraId, {
      vl_produtos: Number(vlProdutos.toFixed(2)),
      vl_total: vlTotal,
    } as any);
  }
}
