import { Injectable } from '../../core/di'
import Cotacao from '../../models/Cotacao'
import { CreateCotacaoDto } from '../dto/cotacao/CreateCotacaoDto'
import { UpdateCotacaoDto } from '../dto/cotacao/UpdateCotacaoDto'
import { CotacaoResponseDto } from '../dto/cotacao/CotacaoResponseDto'
import { CotacaoItemResponseDto } from '../dto/cotacao/CotacaoItemResponseDto'

/**
 * Mapper para entidade Cotacao
 *
 * Converte entre DTOs e entidades, incluindo itens nested.
 */
@Injectable()
export class CotacaoMapper {
  /**
   * Converte DTO para entidade do dominio
   */
  async toEntity(dto: CreateCotacaoDto | UpdateCotacaoDto): Promise<Partial<Cotacao>> {
    const entity: any = {}

    if ('pedidoCompraId' in dto && dto.pedidoCompraId !== undefined) entity.pedidoCompraId = dto.pedidoCompraId
    if ('fornecedorId' in dto && dto.fornecedorId !== undefined) entity.fornecedorId = dto.fornecedorId
    if ('numero' in dto && dto.numero !== undefined) entity.numero = dto.numero
    if ('data_cotacao' in dto && dto.data_cotacao !== undefined) entity.data_cotacao = dto.data_cotacao
    if ('data_validade' in dto && dto.data_validade !== undefined) entity.data_validade = dto.data_validade
    if ('prazo_entrega_dias' in dto && dto.prazo_entrega_dias !== undefined) entity.prazo_entrega_dias = dto.prazo_entrega_dias
    if ('condicao_pagamento' in dto && dto.condicao_pagamento !== undefined) entity.condicao_pagamento = dto.condicao_pagamento
    if ('status' in dto && dto.status !== undefined) entity.status = dto.status
    if ('observacoes' in dto && dto.observacoes !== undefined) entity.observacoes = dto.observacoes
    if ('ativo' in dto && dto.ativo !== undefined) entity.ativo = dto.ativo

    return entity
  }

  /**
   * Converte entidade para DTO de resposta incluindo itens nested
   */
  toResponseDto(entity: Cotacao): CotacaoResponseDto {
    const dto: CotacaoResponseDto = {
      id: entity.id,
      tenantId: entity.tenantId,
      pedidoCompraId: entity.pedidoCompraId,
      fornecedorId: entity.fornecedorId,
      numero: entity.numero,
      data_cotacao: entity.data_cotacao,
      data_validade: entity.data_validade,
      prazo_entrega_dias: entity.prazo_entrega_dias,
      condicao_pagamento: entity.condicao_pagamento,
      vl_total: Number(entity.vl_total) || 0,
      ranking_posicao: entity.ranking_posicao,
      status: entity.status,
      observacoes: entity.observacoes,
      ativo: entity.ativo,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }

    // Mapear fornecedor se disponivel
    if ((entity as any).fornecedor) {
      const f = (entity as any).fornecedor
      dto.fornecedor = {
        id_pessoa: f.id_pessoa || f.id,
        nome: f.nome,
        cnpj_cpf: f.cnpj_cpf,
      }
    }

    // Mapear pedidoCompra se disponivel
    if ((entity as any).pedidoCompra) {
      const po = (entity as any).pedidoCompra
      dto.pedidoCompra = {
        id_ped_compra: po.id_ped_compra || po.id,
        numero: po.numero,
        status: po.status,
      }
    }

    // Mapear itens nested se disponivel
    if ((entity as any).itens && Array.isArray((entity as any).itens)) {
      dto.itens = (entity as any).itens.map((item: any) => this.toItemResponseDto(item))
    }

    return dto
  }

  /**
   * Converte item da cotacao para DTO de resposta
   */
  private toItemResponseDto(item: any): CotacaoItemResponseDto {
    const dto: CotacaoItemResponseDto = {
      id: item.id,
      tenantId: item.tenantId,
      cotacaoId: item.cotacaoId,
      itemPedidoCompraId: item.itemPedidoCompraId,
      produtoId: item.produtoId,
      descricao: item.descricao,
      quantidade: Number(item.quantidade) || 0,
      vl_unitario: Number(item.vl_unitario) || 0,
      vl_total: item.vl_total != null ? Number(item.vl_total) : null,
      observacao: item.observacao,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }

    if (item.produto) {
      dto.produto = {
        id_prod: item.produto.id_prod || item.produto.id,
        descricao: item.produto.descricao,
        unidade: item.produto.unidade,
      }
    }

    if (item.itemPedidoCompra) {
      dto.itemPedidoCompra = {
        id_item_ped: item.itemPedidoCompra.id_item_ped || item.itemPedidoCompra.id,
        quantidade_solicitada: Number(item.itemPedidoCompra.quantidade_solicitada) || 0,
        vl_unitario: Number(item.itemPedidoCompra.vl_unitario) || 0,
      }
    }

    return dto
  }
}
