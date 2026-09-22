import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import BaixaPedidoCompra from '../../models/BaixaPedidoCompra';
import { CreateBaixaPedidoCompraDto } from '../dto/baixaPedidoCompra/CreateBaixaPedidoCompraDto';
import { UpdateBaixaPedidoCompraDto } from '../dto/baixaPedidoCompra/UpdateBaixaPedidoCompraDto';
import { BaixaPedidoCompraResponseDto } from '../dto/baixaPedidoCompra/BaixaPedidoCompraResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade BaixaPedidoCompra
 */
@Injectable()
export class BaixaPedidoCompraMapper implements IMapper<BaixaPedidoCompra, BaixaPedidoCompraResponseDto, CreateBaixaPedidoCompraDto, UpdateBaixaPedidoCompraDto> {
  async toEntity(dto: CreateBaixaPedidoCompraDto | UpdateBaixaPedidoCompraDto): Promise<Partial<BaixaPedidoCompra>> {
    const entity: any = {};

    if ('empresaId' in dto && dto.empresaId !== undefined) {
      entity.empresaId = dto.empresaId;
    }
    if ('notaFiscalId' in dto && dto.notaFiscalId !== undefined) {
      entity.notaFiscalId = dto.notaFiscalId;
    }
    if ('pedidoCompraId' in dto && dto.pedidoCompraId !== undefined) {
      entity.pedidoCompraId = dto.pedidoCompraId;
    }
    if ('data_baixa' in dto && dto.data_baixa !== undefined) {
      entity.data_baixa = dto.data_baixa;
    }
    if ('xml_importado' in dto && dto.xml_importado !== undefined) {
      entity.xml_importado = dto.xml_importado;
    }
    if ('observacoes' in dto && dto.observacoes !== undefined) {
      entity.observacoes = dto.observacoes;
    }
    if ('status' in dto && (dto as UpdateBaixaPedidoCompraDto).status !== undefined) {
      entity.status = (dto as UpdateBaixaPedidoCompraDto).status;
    }
    if ('vl_total_baixa' in dto && (dto as UpdateBaixaPedidoCompraDto).vl_total_baixa !== undefined) {
      entity.vl_total_baixa = (dto as UpdateBaixaPedidoCompraDto).vl_total_baixa;
    }
    if ('vl_divergencia' in dto && (dto as UpdateBaixaPedidoCompraDto).vl_divergencia !== undefined) {
      entity.vl_divergencia = (dto as UpdateBaixaPedidoCompraDto).vl_divergencia;
    }
    if ('percentual_divergencia' in dto && (dto as UpdateBaixaPedidoCompraDto).percentual_divergencia !== undefined) {
      entity.percentual_divergencia = (dto as UpdateBaixaPedidoCompraDto).percentual_divergencia;
    }
    if ('estoque_movimentado' in dto && (dto as UpdateBaixaPedidoCompraDto).estoque_movimentado !== undefined) {
      entity.estoque_movimentado = (dto as UpdateBaixaPedidoCompraDto).estoque_movimentado;
    }
    if ('financeiro_gerado' in dto && (dto as UpdateBaixaPedidoCompraDto).financeiro_gerado !== undefined) {
      entity.financeiro_gerado = (dto as UpdateBaixaPedidoCompraDto).financeiro_gerado;
    }
    if ('motivo_cancelamento' in dto && (dto as UpdateBaixaPedidoCompraDto).motivo_cancelamento !== undefined) {
      entity.motivo_cancelamento = (dto as UpdateBaixaPedidoCompraDto).motivo_cancelamento;
    }
    if ('data_cancelamento' in dto && (dto as UpdateBaixaPedidoCompraDto).data_cancelamento !== undefined) {
      entity.data_cancelamento = (dto as UpdateBaixaPedidoCompraDto).data_cancelamento;
    }
    if ('ativo' in dto && (dto as UpdateBaixaPedidoCompraDto).ativo !== undefined) {
      entity.ativo = (dto as UpdateBaixaPedidoCompraDto).ativo;
    }

    return entity;
  }

  toDto(entity: BaixaPedidoCompra): BaixaPedidoCompraResponseDto {
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

    const dto: BaixaPedidoCompraResponseDto = {
      id_baixa_ped: entity.id_baixa_ped,
      tenantId: entity.tenantId,
      empresaId: entity.empresaId,
      notaFiscalId: entity.notaFiscalId,
      pedidoCompraId: entity.pedidoCompraId,
      usuarioId: entity.usuarioId,
      status: entity.status,
      data_baixa: formatDate((entity as any).data_baixa) || '',
      vl_total_baixa: entity.vl_total_baixa != null ? Number(entity.vl_total_baixa) : 0,
      vl_divergencia: entity.vl_divergencia != null ? Number(entity.vl_divergencia) : 0,
      percentual_divergencia: entity.percentual_divergencia != null ? Number(entity.percentual_divergencia) : 0,
      estoque_movimentado: entity.estoque_movimentado,
      financeiro_gerado: entity.financeiro_gerado,
      xml_importado: entity.xml_importado,
      observacoes: entity.observacoes,
      motivo_cancelamento: entity.motivo_cancelamento,
      data_cancelamento: formatDate(entity.data_cancelamento),
      ativo: entity.ativo,
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

    if ((entity as any).notaFiscal) {
      dto.notaFiscal = {
        id_nf: (entity as any).notaFiscal.id_nf,
        numero: (entity as any).notaFiscal.numero,
        serie: (entity as any).notaFiscal.serie,
        tipo: (entity as any).notaFiscal.tipo,
      };
    }

    if ((entity as any).pedidoCompra) {
      dto.pedidoCompra = {
        id_ped_compra: (entity as any).pedidoCompra.id_ped_compra,
        numero_pedido: (entity as any).pedidoCompra.numero_pedido,
        status: (entity as any).pedidoCompra.status,
      };
    }

    if ((entity as any).usuario) {
      dto.usuario = {
        id: (entity as any).usuario.id,
        nome: (entity as any).usuario.nome,
        email: (entity as any).usuario.email,
      };
    }

    if ((entity as any).usuarioCriador) {
      dto.usuarioCriador = {
        id: (entity as any).usuarioCriador.id,
        nome: (entity as any).usuarioCriador.nome,
        email: (entity as any).usuarioCriador.email,
      };
    }

    adicionarCamposFormatados(dto, ['vl_total_baixa', 'vl_divergencia']);
    return dto;
  }
}
