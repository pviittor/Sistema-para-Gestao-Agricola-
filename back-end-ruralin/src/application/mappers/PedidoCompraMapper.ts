import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import PedidoCompra from '../../models/PedidoCompra';
import { CreatePedidoCompraDto } from '../dto/pedidoCompra/CreatePedidoCompraDto';
import { UpdatePedidoCompraDto } from '../dto/pedidoCompra/UpdatePedidoCompraDto';
import { PedidoCompraResponseDto } from '../dto/pedidoCompra/PedidoCompraResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade PedidoCompra
 */
@Injectable()
export class PedidoCompraMapper implements IMapper<PedidoCompra, PedidoCompraResponseDto, CreatePedidoCompraDto, UpdatePedidoCompraDto> {
  async toEntity(dto: CreatePedidoCompraDto | UpdatePedidoCompraDto): Promise<Partial<PedidoCompra>> {
    const entity: any = {};

    if ('empresaId' in dto && dto.empresaId !== undefined) {
      entity.empresaId = dto.empresaId;
    }
    if ('fornecedorId' in dto && dto.fornecedorId !== undefined) {
      entity.fornecedorId = dto.fornecedorId;
    }
    if ('compradorId' in dto && dto.compradorId !== undefined) {
      entity.compradorId = dto.compradorId;
    }
    if ('data_emissao' in dto && dto.data_emissao !== undefined) {
      entity.data_emissao = dto.data_emissao;
    }
    if ('data_previsao_entrega' in dto && dto.data_previsao_entrega !== undefined) {
      entity.data_previsao_entrega = dto.data_previsao_entrega;
    }
    if ('condicaoPagamentoId' in dto && dto.condicaoPagamentoId !== undefined) {
      entity.condicaoPagamentoId = dto.condicaoPagamentoId;
    }
    if ('forma_pagamento' in dto && dto.forma_pagamento !== undefined) {
      entity.forma_pagamento = dto.forma_pagamento;
    }
    if ('prazo_pagamento_dias' in dto && dto.prazo_pagamento_dias !== undefined) {
      entity.prazo_pagamento_dias = dto.prazo_pagamento_dias;
    }
    if ('localEntregaId' in dto && dto.localEntregaId !== undefined) {
      entity.localEntregaId = dto.localEntregaId;
    }
    if ('cfop' in dto && dto.cfop !== undefined) {
      entity.cfop = dto.cfop;
    }
    if ('vl_frete' in dto && dto.vl_frete !== undefined) {
      entity.vl_frete = dto.vl_frete;
    }
    if ('vl_seguro' in dto && dto.vl_seguro !== undefined) {
      entity.vl_seguro = dto.vl_seguro;
    }
    if ('vl_desconto' in dto && dto.vl_desconto !== undefined) {
      entity.vl_desconto = dto.vl_desconto;
    }
    if ('vl_outros' in dto && dto.vl_outros !== undefined) {
      entity.vl_outros = dto.vl_outros;
    }
    if ('percentual_tolerancia' in dto && dto.percentual_tolerancia !== undefined) {
      entity.percentual_tolerancia = dto.percentual_tolerancia;
    }
    if ('permite_entrega_parcial' in dto && dto.permite_entrega_parcial !== undefined) {
      entity.permite_entrega_parcial = dto.permite_entrega_parcial;
    }
    if ('observacoes' in dto && dto.observacoes !== undefined) {
      entity.observacoes = dto.observacoes;
    }
    if ('observacoes_fornecedor' in dto && dto.observacoes_fornecedor !== undefined) {
      entity.observacoes_fornecedor = dto.observacoes_fornecedor;
    }
    if ('condicao_pagamento' in dto && (dto as any).condicao_pagamento !== undefined) {
      entity.condicao_pagamento = (dto as any).condicao_pagamento;
    }
    if ('parcelas_qtd' in dto && (dto as any).parcelas_qtd !== undefined) {
      entity.parcelas_qtd = (dto as any).parcelas_qtd;
    }

    return entity;
  }

  toDto(entity: PedidoCompra): PedidoCompraResponseDto {
    const formatDate = (date: Date | string | null | undefined): string | null => {
      if (!date) return null;
      if (typeof date === 'string') {
        try {
          const d = new Date(date);
          return d.toISOString().split('T')[0];
        } catch (e) {
          return date.split('T')[0];
        }
      }
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      return null;
    };

    const dto: PedidoCompraResponseDto = {
      id_ped_compra: entity.id_ped_compra,
      tenantId: entity.tenantId,
      numero: entity.numero,
      empresaId: entity.empresaId,
      fornecedorId: entity.fornecedorId,
      compradorId: entity.compradorId,
      status: entity.status,
      data_emissao: formatDate((entity as any).data_emissao) || '',
      data_previsao_entrega: formatDate((entity as any).data_previsao_entrega),
      data_aprovacao: formatDate((entity as any).data_aprovacao),
      aprovadoPorId: entity.aprovadoPorId,
      condicaoPagamentoId: entity.condicaoPagamentoId,
      forma_pagamento: entity.forma_pagamento,
      prazo_pagamento_dias: entity.prazo_pagamento_dias,
      localEntregaId: entity.localEntregaId,
      cfop: entity.cfop,
      vl_produtos: entity.vl_produtos != null ? Number(entity.vl_produtos) : 0,
      vl_frete: entity.vl_frete != null ? Number(entity.vl_frete) : 0,
      vl_seguro: entity.vl_seguro != null ? Number(entity.vl_seguro) : 0,
      vl_desconto: entity.vl_desconto != null ? Number(entity.vl_desconto) : 0,
      vl_outros: entity.vl_outros != null ? Number(entity.vl_outros) : 0,
      vl_total: entity.vl_total != null ? Number(entity.vl_total) : 0,
      percentual_tolerancia: entity.percentual_tolerancia != null ? Number(entity.percentual_tolerancia) : 0,
      permite_entrega_parcial: entity.permite_entrega_parcial,
      observacoes: entity.observacoes,
      observacoes_fornecedor: entity.observacoes_fornecedor,
      motivo_cancelamento: entity.motivo_cancelamento,
      data_cancelamento: formatDate((entity as any).data_cancelamento),
      ativo: entity.ativo,
      condicao_pagamento: (entity as any).condicao_pagamento || null,
      parcelas_qtd: (entity as any).parcelas_qtd || null,
      cotacao_vencedora_id: (entity as any).cotacao_vencedora_id || null,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Relacionamentos condicionais
    if ((entity as any).empresa) {
      dto.empresa = {
        id_pessoa: (entity as any).empresa.id_pessoa,
        nomerazao_pessoa: (entity as any).empresa.nomerazao_pessoa,
      };
    }

    if ((entity as any).fornecedor) {
      dto.fornecedor = {
        id_pessoa: (entity as any).fornecedor.id_pessoa,
        nomerazao_pessoa: (entity as any).fornecedor.nomerazao_pessoa,
      };
    }

    if ((entity as any).comprador) {
      dto.comprador = {
        id: (entity as any).comprador.id,
        nome: (entity as any).comprador.nome,
        email: (entity as any).comprador.email,
      };
    }

    if ((entity as any).aprovador) {
      dto.aprovador = {
        id: (entity as any).aprovador.id,
        nome: (entity as any).aprovador.nome,
        email: (entity as any).aprovador.email,
      };
    }

    if ((entity as any).usuarioCriador) {
      dto.usuarioCriador = {
        id: (entity as any).usuarioCriador.id,
        nome: (entity as any).usuarioCriador.nome,
        email: (entity as any).usuarioCriador.email,
      };
    }

    // Mapear itens se incluidos (master-detail pattern)
    if ((entity as any).itens && Array.isArray((entity as any).itens)) {
      dto.itens = (entity as any).itens.map((item: any) => {
        const itemDto: any = {
          id_item_ped: item.id_item_ped,
          pedidoCompraId: item.pedidoCompraId,
          numero_item: item.numero_item,
          produtoId: item.produtoId,
          descricao: item.descricao,
          unidade: item.unidade,
          quantidade_solicitada: Number(item.quantidade_solicitada),
          quantidade_atendida: Number(item.quantidade_atendida),
          quantidade_pendente: Number(item.quantidade_pendente),
          vl_unitario: Number(item.vl_unitario),
          vl_desconto: Number(item.vl_desconto || 0),
          vl_bruto: Number(item.vl_bruto || 0),
          vl_total: Number(item.vl_total || 0),
          status: item.status,
          depositoDestinoId: item.depositoDestinoId,
          observacao: item.observacao,
        };
        if (item.produto) {
          itemDto.produto = {
            id_prod: item.produto.id_prod,
            descricao_prod: item.produto.descricao_prod,
          };
        }
        adicionarCamposFormatados(itemDto, ['vl_unitario', 'vl_desconto', 'vl_bruto', 'vl_total']);
        return itemDto;
      });
    }

    adicionarCamposFormatados(dto, ['vl_produtos', 'vl_frete', 'vl_seguro', 'vl_desconto', 'vl_outros', 'vl_total']);
    return dto;
  }
}
