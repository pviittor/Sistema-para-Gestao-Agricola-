import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import NotaFiscal from '../../models/NotaFiscal';
import { CreateNotaFiscalDto } from '../dto/notaFiscal/CreateNotaFiscalDto';
import { UpdateNotaFiscalDto } from '../dto/notaFiscal/UpdateNotaFiscalDto';
import { NotaFiscalResponseDto } from '../dto/notaFiscal/NotaFiscalResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade NotaFiscal
 */
@Injectable()
export class NotaFiscalMapper implements IMapper<NotaFiscal, NotaFiscalResponseDto, CreateNotaFiscalDto, UpdateNotaFiscalDto> {
  async toEntity(dto: CreateNotaFiscalDto | UpdateNotaFiscalDto): Promise<Partial<NotaFiscal>> {
    const entity: any = {};

    if ('tipo' in dto && dto.tipo !== undefined) {
      entity.tipo = dto.tipo;
    }
    if ('numero' in dto && dto.numero !== undefined) {
      entity.numero = dto.numero;
    }
    if ('serie' in dto && dto.serie !== undefined) {
      entity.serie = dto.serie;
    }
    if ('chave_acesso' in dto && dto.chave_acesso !== undefined) {
      entity.chave_acesso = dto.chave_acesso;
    }
    if ('modelo' in dto && dto.modelo !== undefined) {
      entity.modelo = dto.modelo;
    }
    if ('natureza_operacao' in dto && dto.natureza_operacao !== undefined) {
      entity.natureza_operacao = dto.natureza_operacao;
    }
    if ('cfop' in dto && dto.cfop !== undefined) {
      entity.cfop = dto.cfop;
    }
    if ('finalidade' in dto && dto.finalidade !== undefined) {
      entity.finalidade = dto.finalidade;
    }
    if ('data_emissao' in dto && dto.data_emissao !== undefined) {
      entity.data_emissao = dto.data_emissao;
    }
    if ('data_entrada_saida' in dto && dto.data_entrada_saida !== undefined) {
      entity.data_entrada_saida = dto.data_entrada_saida;
    }
    if ('hora_entrada_saida' in dto && dto.hora_entrada_saida !== undefined) {
      entity.hora_entrada_saida = dto.hora_entrada_saida;
    }
    if ('emitenteId' in dto && dto.emitenteId !== undefined) {
      entity.emitenteId = dto.emitenteId;
    }
    if ('destinatarioId' in dto && dto.destinatarioId !== undefined) {
      entity.destinatarioId = dto.destinatarioId;
    }
    if ('empresaId' in dto && dto.empresaId !== undefined) {
      entity.empresaId = dto.empresaId;
    }
    if ('transportadoraId' in dto && dto.transportadoraId !== undefined) {
      entity.transportadoraId = dto.transportadoraId;
    }
    if ('modalidade_frete' in dto && dto.modalidade_frete !== undefined) {
      entity.modalidade_frete = dto.modalidade_frete;
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
    if ('volumes_qtd' in dto && dto.volumes_qtd !== undefined) {
      entity.volumes_qtd = dto.volumes_qtd;
    }
    if ('volumes_especie' in dto && dto.volumes_especie !== undefined) {
      entity.volumes_especie = dto.volumes_especie;
    }
    if ('peso_bruto' in dto && dto.peso_bruto !== undefined) {
      entity.peso_bruto = dto.peso_bruto;
    }
    if ('peso_liquido' in dto && dto.peso_liquido !== undefined) {
      entity.peso_liquido = dto.peso_liquido;
    }
    if ('informacoes_adicionais' in dto && dto.informacoes_adicionais !== undefined) {
      entity.informacoes_adicionais = dto.informacoes_adicionais;
    }
    if ('informacoes_complementares' in dto && dto.informacoes_complementares !== undefined) {
      entity.informacoes_complementares = dto.informacoes_complementares;
    }
    if ('notaFiscalRefId' in dto && dto.notaFiscalRefId !== undefined) {
      entity.notaFiscalRefId = dto.notaFiscalRefId;
    }
    if ('cfopId' in dto && (dto as any).cfopId !== undefined) {
      entity.cfopId = (dto as any).cfopId;
    }
    if ('certificadoDigitalId' in dto && (dto as any).certificadoDigitalId !== undefined) {
      entity.certificadoDigitalId = (dto as any).certificadoDigitalId;
    }
    if ('ambiente_sefaz' in dto && (dto as any).ambiente_sefaz !== undefined) {
      entity.ambiente_sefaz = (dto as any).ambiente_sefaz;
    }
    if ('condicao_pagamento' in dto && (dto as any).condicao_pagamento !== undefined) {
      entity.condicao_pagamento = (dto as any).condicao_pagamento;
    }
    if ('parcelas_qtd' in dto && (dto as any).parcelas_qtd !== undefined) {
      entity.parcelas_qtd = (dto as any).parcelas_qtd;
    }

    return entity;
  }

  toDto(entity: NotaFiscal): NotaFiscalResponseDto {
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

    const formatDateTime = (date: Date | string | null | undefined): string | null => {
      if (!date) return null;
      if (typeof date === 'string') {
        return date;
      }
      if (date instanceof Date) {
        return date.toISOString();
      }
      return null;
    };

    const dto: NotaFiscalResponseDto = {
      id_nf: entity.id_nf,
      tenantId: entity.tenantId,
      tipo: entity.tipo,
      numero: entity.numero,
      serie: entity.serie,
      chave_acesso: entity.chave_acesso,
      modelo: entity.modelo,
      natureza_operacao: entity.natureza_operacao,
      cfop: entity.cfop,
      finalidade: entity.finalidade,
      data_emissao: formatDate((entity as any).data_emissao) || '',
      data_entrada_saida: formatDate((entity as any).data_entrada_saida) || '',
      hora_entrada_saida: entity.hora_entrada_saida,
      status: entity.status,
      emitenteId: entity.emitenteId,
      destinatarioId: entity.destinatarioId,
      empresaId: entity.empresaId,
      transportadoraId: entity.transportadoraId,
      modalidade_frete: entity.modalidade_frete,
      vl_produtos: entity.vl_produtos != null ? Number(entity.vl_produtos) : 0,
      vl_frete: entity.vl_frete != null ? Number(entity.vl_frete) : 0,
      vl_seguro: entity.vl_seguro != null ? Number(entity.vl_seguro) : 0,
      vl_desconto: entity.vl_desconto != null ? Number(entity.vl_desconto) : 0,
      vl_outros: entity.vl_outros != null ? Number(entity.vl_outros) : 0,
      vl_ipi: entity.vl_ipi != null ? Number(entity.vl_ipi) : 0,
      vl_icms: entity.vl_icms != null ? Number(entity.vl_icms) : 0,
      vl_pis: entity.vl_pis != null ? Number(entity.vl_pis) : 0,
      vl_cofins: entity.vl_cofins != null ? Number(entity.vl_cofins) : 0,
      vl_total: entity.vl_total != null ? Number(entity.vl_total) : 0,
      volumes_qtd: entity.volumes_qtd,
      volumes_especie: entity.volumes_especie,
      peso_bruto: entity.peso_bruto != null ? Number(entity.peso_bruto) : null,
      peso_liquido: entity.peso_liquido != null ? Number(entity.peso_liquido) : null,
      informacoes_adicionais: entity.informacoes_adicionais,
      informacoes_complementares: entity.informacoes_complementares,
      xml_autorizacao: entity.xml_autorizacao,
      protocolo_autorizacao: entity.protocolo_autorizacao,
      data_autorizacao: formatDateTime(entity.data_autorizacao),
      motivo_cancelamento: entity.motivo_cancelamento,
      data_cancelamento: formatDateTime(entity.data_cancelamento),
      estoque_movimentado: entity.estoque_movimentado,
      financeiro_gerado: entity.financeiro_gerado,
      ativo: entity.ativo,
      notaFiscalRefId: entity.notaFiscalRefId,
      cfopId: (entity as any).cfopId || null,
      certificadoDigitalId: (entity as any).certificadoDigitalId || null,
      ambiente_sefaz: (entity as any).ambiente_sefaz || null,
      condicao_pagamento: (entity as any).condicao_pagamento || null,
      parcelas_qtd: (entity as any).parcelas_qtd || null,
      contingencia: (entity as any).contingencia || null,
      contingencia_motivo: (entity as any).contingencia_motivo || null,
      contingencia_data: formatDateTime((entity as any).contingencia_data),
      numero_sequencial: (entity as any).numero_sequencial || null,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Relacionamentos condicionais
    if ((entity as any).emitente) {
      dto.emitente = {
        id_pessoa: (entity as any).emitente.id_pessoa,
        nomerazao_pessoa: (entity as any).emitente.nomerazao_pessoa,
      };
    }

    if ((entity as any).destinatario) {
      dto.destinatario = {
        id_pessoa: (entity as any).destinatario.id_pessoa,
        nomerazao_pessoa: (entity as any).destinatario.nomerazao_pessoa,
      };
    }

    if ((entity as any).empresa) {
      dto.empresa = {
        id_pessoa: (entity as any).empresa.id_pessoa,
        nomerazao_pessoa: (entity as any).empresa.nomerazao_pessoa,
      };
    }

    if ((entity as any).transportadora) {
      dto.transportadora = {
        id_pessoa: (entity as any).transportadora.id_pessoa,
        nomerazao_pessoa: (entity as any).transportadora.nomerazao_pessoa,
      };
    }

    if ((entity as any).notaFiscalRef) {
      dto.notaFiscalRef = {
        id_nf: (entity as any).notaFiscalRef.id_nf,
        numero: (entity as any).notaFiscalRef.numero,
        serie: (entity as any).notaFiscalRef.serie,
        modelo: (entity as any).notaFiscalRef.modelo,
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
          id_item_nf: item.id_item_nf,
          notaFiscalId: item.notaFiscalId,
          produtoId: item.produtoId,
          numero_item: item.numero_item,
          codigo_produto: item.codigo_produto,
          descricao: item.descricao,
          ncm: item.ncm,
          cfop: item.cfop,
          unidade: item.unidade,
          quantidade: Number(item.quantidade),
          vl_unitario: Number(item.vl_unitario),
          vl_desconto: Number(item.vl_desconto || 0),
          vl_frete: Number(item.vl_frete || 0),
          vl_seguro: Number(item.vl_seguro || 0),
          vl_outros: Number(item.vl_outros || 0),
          vl_bruto: Number(item.vl_bruto || 0),
          vl_total: Number(item.vl_total || 0),
        };
        if (item.produto) {
          itemDto.produto = {
            id_prod: item.produto.id_prod,
            descricao_prod: item.produto.descricao_prod,
          };
        }
        adicionarCamposFormatados(itemDto, ['vl_unitario', 'vl_desconto', 'vl_frete', 'vl_seguro', 'vl_outros', 'vl_bruto', 'vl_total']);
        return itemDto;
      });
    }

    adicionarCamposFormatados(dto, ['vl_produtos', 'vl_frete', 'vl_seguro', 'vl_desconto', 'vl_outros', 'vl_ipi', 'vl_icms', 'vl_pis', 'vl_cofins', 'vl_total']);
    return dto;
  }
}
