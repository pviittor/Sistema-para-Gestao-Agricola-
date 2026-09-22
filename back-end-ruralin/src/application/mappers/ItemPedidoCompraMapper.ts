import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import ItemPedidoCompra from '../../models/ItemPedidoCompra';
import { CreateItemPedidoCompraDto } from '../dto/itemPedidoCompra/CreateItemPedidoCompraDto';
import { UpdateItemPedidoCompraDto } from '../dto/itemPedidoCompra/UpdateItemPedidoCompraDto';
import { ItemPedidoCompraResponseDto } from '../dto/itemPedidoCompra/ItemPedidoCompraResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade ItemPedidoCompra
 */
@Injectable()
export class ItemPedidoCompraMapper implements IMapper<ItemPedidoCompra, ItemPedidoCompraResponseDto, CreateItemPedidoCompraDto, UpdateItemPedidoCompraDto> {
  async toEntity(dto: CreateItemPedidoCompraDto | UpdateItemPedidoCompraDto): Promise<Partial<ItemPedidoCompra>> {
    const entity: any = {};

    if ('pedidoCompraId' in dto && dto.pedidoCompraId !== undefined) {
      entity.pedidoCompraId = dto.pedidoCompraId;
    }
    if ('produtoId' in dto && dto.produtoId !== undefined) {
      entity.produtoId = dto.produtoId;
    }
    if ('descricao' in dto && dto.descricao !== undefined) {
      entity.descricao = dto.descricao;
    }
    if ('unidade' in dto && dto.unidade !== undefined) {
      entity.unidade = dto.unidade;
    }
    if ('quantidade_solicitada' in dto && dto.quantidade_solicitada !== undefined) {
      entity.quantidade_solicitada = dto.quantidade_solicitada;
    }
    if ('vl_unitario' in dto && dto.vl_unitario !== undefined) {
      entity.vl_unitario = dto.vl_unitario;
    }
    if ('vl_desconto' in dto && dto.vl_desconto !== undefined) {
      entity.vl_desconto = dto.vl_desconto;
    }
    if ('depositoDestinoId' in dto && dto.depositoDestinoId !== undefined) {
      entity.depositoDestinoId = dto.depositoDestinoId;
    }
    if ('observacao' in dto && dto.observacao !== undefined) {
      entity.observacao = dto.observacao;
    }

    return entity;
  }

  toDto(entity: ItemPedidoCompra): ItemPedidoCompraResponseDto {
    const toNumber = (val: any): number => (val != null ? Number(val) : 0);

    const dto: ItemPedidoCompraResponseDto = {
      id_item_ped: entity.id_item_ped,
      tenantId: entity.tenantId,
      pedidoCompraId: entity.pedidoCompraId,
      numero_item: entity.numero_item,
      produtoId: entity.produtoId,
      descricao: entity.descricao,
      unidade: entity.unidade,
      quantidade_solicitada: toNumber(entity.quantidade_solicitada),
      quantidade_atendida: toNumber(entity.quantidade_atendida),
      quantidade_pendente: toNumber(entity.quantidade_pendente),
      vl_unitario: toNumber(entity.vl_unitario),
      vl_desconto: toNumber(entity.vl_desconto),
      vl_bruto: toNumber(entity.vl_bruto),
      vl_total: toNumber(entity.vl_total),
      status: entity.status,
      depositoDestinoId: entity.depositoDestinoId,
      observacao: entity.observacao,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Relacionamentos condicionais
    if ((entity as any).pedidoCompra) {
      dto.pedidoCompra = {
        id_ped_compra: (entity as any).pedidoCompra.id_ped_compra,
        numero: (entity as any).pedidoCompra.numero,
        status: (entity as any).pedidoCompra.status,
      };
    }

    if ((entity as any).produto) {
      dto.produto = {
        id_prod: (entity as any).produto.id_prod,
        descricao_prod: (entity as any).produto.descricao_prod,
      };
    }

    if ((entity as any).usuarioCriador) {
      dto.usuarioCriador = {
        id: (entity as any).usuarioCriador.id,
        nome: (entity as any).usuarioCriador.nome,
        email: (entity as any).usuarioCriador.email,
      };
    }

    adicionarCamposFormatados(dto, ['vl_unitario', 'vl_desconto', 'vl_bruto', 'vl_total']);
    return dto;
  }
}
