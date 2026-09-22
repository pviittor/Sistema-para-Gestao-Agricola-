import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import ItemBaixaPedidoCompra from '../../models/ItemBaixaPedidoCompra';
import { CreateItemBaixaPedidoCompraDto } from '../dto/itemBaixaPedidoCompra/CreateItemBaixaPedidoCompraDto';
import { UpdateItemBaixaPedidoCompraDto } from '../dto/itemBaixaPedidoCompra/UpdateItemBaixaPedidoCompraDto';
import { ItemBaixaPedidoCompraResponseDto } from '../dto/itemBaixaPedidoCompra/ItemBaixaPedidoCompraResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade ItemBaixaPedidoCompra
 */
@Injectable()
export class ItemBaixaPedidoCompraMapper implements IMapper<ItemBaixaPedidoCompra, ItemBaixaPedidoCompraResponseDto, CreateItemBaixaPedidoCompraDto, UpdateItemBaixaPedidoCompraDto> {
  async toEntity(dto: CreateItemBaixaPedidoCompraDto | UpdateItemBaixaPedidoCompraDto): Promise<Partial<ItemBaixaPedidoCompra>> {
    const entity: any = {};

    if ('baixaPedidoCompraId' in dto && dto.baixaPedidoCompraId !== undefined) {
      entity.baixaPedidoCompraId = dto.baixaPedidoCompraId;
    }
    if ('itemPedidoCompraId' in dto && dto.itemPedidoCompraId !== undefined) {
      entity.itemPedidoCompraId = dto.itemPedidoCompraId;
    }
    if ('itemNotaFiscalId' in dto && dto.itemNotaFiscalId !== undefined) {
      entity.itemNotaFiscalId = dto.itemNotaFiscalId;
    }
    if ('quantidade' in dto && dto.quantidade !== undefined) {
      entity.quantidade = dto.quantidade;
    }
    if ('vl_unitario_pedido' in dto && dto.vl_unitario_pedido !== undefined) {
      entity.vl_unitario_pedido = dto.vl_unitario_pedido;
    }
    if ('vl_unitario_nf' in dto && dto.vl_unitario_nf !== undefined) {
      entity.vl_unitario_nf = dto.vl_unitario_nf;
    }
    if ('vl_divergencia' in dto && (dto as UpdateItemBaixaPedidoCompraDto).vl_divergencia !== undefined) {
      entity.vl_divergencia = (dto as UpdateItemBaixaPedidoCompraDto).vl_divergencia;
    }
    if ('divergencia_aprovada' in dto && dto.divergencia_aprovada !== undefined) {
      entity.divergencia_aprovada = dto.divergencia_aprovada;
    }

    return entity;
  }

  toDto(entity: ItemBaixaPedidoCompra): ItemBaixaPedidoCompraResponseDto {
    const toNumber = (val: any): number => (val != null ? Number(val) : 0);

    const dto: ItemBaixaPedidoCompraResponseDto = {
      id_item_baixa_ped: entity.id_item_baixa_ped,
      tenantId: entity.tenantId,
      baixaPedidoCompraId: entity.baixaPedidoCompraId,
      itemPedidoCompraId: entity.itemPedidoCompraId,
      itemNotaFiscalId: entity.itemNotaFiscalId,
      quantidade: toNumber(entity.quantidade),
      vl_unitario_pedido: toNumber(entity.vl_unitario_pedido),
      vl_unitario_nf: toNumber(entity.vl_unitario_nf),
      vl_divergencia: toNumber(entity.vl_divergencia),
      divergencia_aprovada: entity.divergencia_aprovada,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Relacionamentos condicionais
    if ((entity as any).baixaPedidoCompra) {
      const formatDate = (date: Date | string | null | undefined): string => {
        if (!date) return '';
        if (typeof date === 'string') return date.split('T')[0];
        if (date instanceof Date) return date.toISOString().split('T')[0];
        return '';
      };
      dto.baixaPedidoCompra = {
        id_baixa_ped: (entity as any).baixaPedidoCompra.id_baixa_ped,
        status: (entity as any).baixaPedidoCompra.status,
        data_baixa: formatDate((entity as any).baixaPedidoCompra.data_baixa),
      };
    }

    if ((entity as any).itemPedidoCompra) {
      dto.itemPedidoCompra = {
        id_item_ped: (entity as any).itemPedidoCompra.id_item_ped,
        quantidade: toNumber((entity as any).itemPedidoCompra.quantidade),
        vl_unitario: toNumber((entity as any).itemPedidoCompra.vl_unitario),
      };
    }

    if ((entity as any).itemNotaFiscal) {
      dto.itemNotaFiscal = {
        id_item_nf: (entity as any).itemNotaFiscal.id_item_nf,
        descricao: (entity as any).itemNotaFiscal.descricao,
        quantidade: toNumber((entity as any).itemNotaFiscal.quantidade),
        vl_unitario: toNumber((entity as any).itemNotaFiscal.vl_unitario),
      };
    }

    if ((entity as any).usuarioCriador) {
      dto.usuarioCriador = {
        id: (entity as any).usuarioCriador.id,
        nome: (entity as any).usuarioCriador.nome,
        email: (entity as any).usuarioCriador.email,
      };
    }

    adicionarCamposFormatados(dto, ['vl_unitario_pedido', 'vl_unitario_nf', 'vl_divergencia']);
    return dto;
  }
}
