import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import ItemNotaFiscal from '../../models/ItemNotaFiscal';
import { CreateItemNotaFiscalDto } from '../dto/itemNotaFiscal/CreateItemNotaFiscalDto';
import { UpdateItemNotaFiscalDto } from '../dto/itemNotaFiscal/UpdateItemNotaFiscalDto';
import { ItemNotaFiscalResponseDto } from '../dto/itemNotaFiscal/ItemNotaFiscalResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade ItemNotaFiscal
 */
@Injectable()
export class ItemNotaFiscalMapper implements IMapper<ItemNotaFiscal, ItemNotaFiscalResponseDto, CreateItemNotaFiscalDto, UpdateItemNotaFiscalDto> {
  async toEntity(dto: CreateItemNotaFiscalDto | UpdateItemNotaFiscalDto): Promise<Partial<ItemNotaFiscal>> {
    const entity: any = {};

    if ('notaFiscalId' in dto && dto.notaFiscalId !== undefined) {
      entity.notaFiscalId = dto.notaFiscalId;
    }
    if ('produtoId' in dto && dto.produtoId !== undefined) {
      entity.produtoId = dto.produtoId;
    }
    if ('numero_item' in dto && dto.numero_item !== undefined) {
      entity.numero_item = dto.numero_item;
    }
    if ('codigo_produto' in dto && dto.codigo_produto !== undefined) {
      entity.codigo_produto = dto.codigo_produto;
    }
    if ('descricao' in dto && dto.descricao !== undefined) {
      entity.descricao = dto.descricao;
    }
    if ('ncm' in dto && dto.ncm !== undefined) {
      entity.ncm = dto.ncm;
    }
    if ('cest' in dto && dto.cest !== undefined) {
      entity.cest = dto.cest;
    }
    if ('cfop' in dto && dto.cfop !== undefined) {
      entity.cfop = dto.cfop;
    }
    if ('unidade' in dto && dto.unidade !== undefined) {
      entity.unidade = dto.unidade;
    }
    if ('quantidade' in dto && dto.quantidade !== undefined) {
      entity.quantidade = dto.quantidade;
    }
    if ('vl_unitario' in dto && dto.vl_unitario !== undefined) {
      entity.vl_unitario = dto.vl_unitario;
    }
    if ('vl_desconto' in dto && dto.vl_desconto !== undefined) {
      entity.vl_desconto = dto.vl_desconto;
    }
    if ('vl_frete' in dto && dto.vl_frete !== undefined) {
      entity.vl_frete = dto.vl_frete;
    }
    if ('vl_seguro' in dto && dto.vl_seguro !== undefined) {
      entity.vl_seguro = dto.vl_seguro;
    }
    if ('vl_outros' in dto && dto.vl_outros !== undefined) {
      entity.vl_outros = dto.vl_outros;
    }
    if ('cst_icms' in dto && dto.cst_icms !== undefined) {
      entity.cst_icms = dto.cst_icms;
    }
    if ('modalidade_bc_icms' in dto && dto.modalidade_bc_icms !== undefined) {
      entity.modalidade_bc_icms = dto.modalidade_bc_icms;
    }
    if ('aliq_icms' in dto && dto.aliq_icms !== undefined) {
      entity.aliq_icms = dto.aliq_icms;
    }
    if ('vl_bc_icms' in dto && dto.vl_bc_icms !== undefined) {
      entity.vl_bc_icms = dto.vl_bc_icms;
    }
    if ('vl_icms' in dto && dto.vl_icms !== undefined) {
      entity.vl_icms = dto.vl_icms;
    }
    if ('aliq_icms_st' in dto && dto.aliq_icms_st !== undefined) {
      entity.aliq_icms_st = dto.aliq_icms_st;
    }
    if ('vl_bc_icms_st' in dto && dto.vl_bc_icms_st !== undefined) {
      entity.vl_bc_icms_st = dto.vl_bc_icms_st;
    }
    if ('vl_icms_st' in dto && dto.vl_icms_st !== undefined) {
      entity.vl_icms_st = dto.vl_icms_st;
    }
    if ('cst_ipi' in dto && dto.cst_ipi !== undefined) {
      entity.cst_ipi = dto.cst_ipi;
    }
    if ('aliq_ipi' in dto && dto.aliq_ipi !== undefined) {
      entity.aliq_ipi = dto.aliq_ipi;
    }
    if ('vl_ipi' in dto && dto.vl_ipi !== undefined) {
      entity.vl_ipi = dto.vl_ipi;
    }
    if ('cst_pis' in dto && dto.cst_pis !== undefined) {
      entity.cst_pis = dto.cst_pis;
    }
    if ('aliq_pis' in dto && dto.aliq_pis !== undefined) {
      entity.aliq_pis = dto.aliq_pis;
    }
    if ('vl_pis' in dto && dto.vl_pis !== undefined) {
      entity.vl_pis = dto.vl_pis;
    }
    if ('cst_cofins' in dto && dto.cst_cofins !== undefined) {
      entity.cst_cofins = dto.cst_cofins;
    }
    if ('aliq_cofins' in dto && dto.aliq_cofins !== undefined) {
      entity.aliq_cofins = dto.aliq_cofins;
    }
    if ('vl_cofins' in dto && dto.vl_cofins !== undefined) {
      entity.vl_cofins = dto.vl_cofins;
    }
    if ('numero_lote' in dto && dto.numero_lote !== undefined) {
      entity.numero_lote = dto.numero_lote;
    }
    if ('data_fabricacao' in dto && dto.data_fabricacao !== undefined) {
      entity.data_fabricacao = dto.data_fabricacao;
    }
    if ('data_validade' in dto && dto.data_validade !== undefined) {
      entity.data_validade = dto.data_validade;
    }
    if ('numero_serie_item' in dto && dto.numero_serie_item !== undefined) {
      entity.numero_serie_item = dto.numero_serie_item;
    }
    if ('informacoes_adicionais' in dto && dto.informacoes_adicionais !== undefined) {
      entity.informacoes_adicionais = dto.informacoes_adicionais;
    }
    if ('itemPedidoCompraId' in dto && (dto as any).itemPedidoCompraId !== undefined) {
      entity.itemPedidoCompraId = (dto as any).itemPedidoCompraId;
    }

    return entity;
  }

  toDto(entity: ItemNotaFiscal): ItemNotaFiscalResponseDto {
    const toNumber = (val: any): number => (val != null ? Number(val) : 0);

    const dto: ItemNotaFiscalResponseDto = {
      id_item_nf: entity.id_item_nf,
      tenantId: entity.tenantId,
      notaFiscalId: entity.notaFiscalId,
      produtoId: entity.produtoId,
      numero_item: entity.numero_item,
      codigo_produto: entity.codigo_produto,
      descricao: entity.descricao,
      ncm: entity.ncm,
      cest: entity.cest,
      cfop: entity.cfop,
      unidade: entity.unidade,
      quantidade: toNumber(entity.quantidade),
      vl_unitario: toNumber(entity.vl_unitario),
      vl_desconto: toNumber(entity.vl_desconto),
      vl_frete: toNumber(entity.vl_frete),
      vl_seguro: toNumber(entity.vl_seguro),
      vl_outros: toNumber(entity.vl_outros),
      vl_bruto: toNumber(entity.vl_bruto),
      vl_total: toNumber(entity.vl_total),
      cst_icms: entity.cst_icms,
      modalidade_bc_icms: entity.modalidade_bc_icms,
      aliq_icms: toNumber(entity.aliq_icms),
      vl_bc_icms: toNumber(entity.vl_bc_icms),
      vl_icms: toNumber(entity.vl_icms),
      aliq_icms_st: toNumber(entity.aliq_icms_st),
      vl_bc_icms_st: toNumber(entity.vl_bc_icms_st),
      vl_icms_st: toNumber(entity.vl_icms_st),
      cst_ipi: entity.cst_ipi,
      aliq_ipi: toNumber(entity.aliq_ipi),
      vl_ipi: toNumber(entity.vl_ipi),
      cst_pis: entity.cst_pis,
      aliq_pis: toNumber(entity.aliq_pis),
      vl_pis: toNumber(entity.vl_pis),
      cst_cofins: entity.cst_cofins,
      aliq_cofins: toNumber(entity.aliq_cofins),
      vl_cofins: toNumber(entity.vl_cofins),
      numero_lote: entity.numero_lote,
      data_fabricacao: entity.data_fabricacao,
      data_validade: entity.data_validade,
      numero_serie_item: entity.numero_serie_item,
      informacoes_adicionais: entity.informacoes_adicionais,
      movimentou_estoque: entity.movimentou_estoque,
      itemPedidoCompraId: entity.itemPedidoCompraId ?? null,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Relacionamentos condicionais
    if ((entity as any).notaFiscal) {
      dto.notaFiscal = {
        id_nf: (entity as any).notaFiscal.id_nf,
        numero: (entity as any).notaFiscal.numero,
        serie: (entity as any).notaFiscal.serie,
        tipo: (entity as any).notaFiscal.tipo,
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

    adicionarCamposFormatados(dto, ['vl_unitario', 'vl_desconto', 'vl_frete', 'vl_seguro', 'vl_outros', 'vl_bruto', 'vl_total', 'vl_bc_icms', 'vl_icms', 'vl_bc_icms_st', 'vl_icms_st', 'vl_ipi', 'vl_pis', 'vl_cofins']);
    return dto;
  }
}
