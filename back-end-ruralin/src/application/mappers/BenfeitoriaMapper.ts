import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import Benfeitoria from '../../models/Benfeitoria';
import { CreateBenfeitoriaDto } from '../dto/benfeitoria/CreateBenfeitoriaDto';
import { UpdateBenfeitoriaDto } from '../dto/benfeitoria/UpdateBenfeitoriaDto';
import { BenfeitoriaResponseDto } from '../dto/benfeitoria/BenfeitoriaResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade Benfeitoria
 */
@Injectable()
export class BenfeitoriaMapper implements IMapper<Benfeitoria, BenfeitoriaResponseDto, CreateBenfeitoriaDto, UpdateBenfeitoriaDto> {
  async toEntity(dto: CreateBenfeitoriaDto | UpdateBenfeitoriaDto): Promise<Partial<Benfeitoria>> {
    const entity: any = {};

    if ('descricao' in dto && dto.descricao !== undefined) {
      entity.descricao = dto.descricao;
    }
    if ('valortotal' in dto && dto.valortotal !== undefined) {
      entity.valortotal = dto.valortotal;
    }
    if ('vidautil' in dto && dto.vidautil !== undefined) {
      entity.vidautil = dto.vidautil;
    }
    if ('percsucata' in dto && dto.percsucata !== undefined) {
      entity.percsucata = dto.percsucata;
    }
    if ('depreciacaoano' in dto && dto.depreciacaoano !== undefined) {
      entity.depreciacaoano = dto.depreciacaoano;
    }
    if ('taxamanutencao' in dto && dto.taxamanutencao !== undefined) {
      entity.taxamanutencao = dto.taxamanutencao;
    }
    if ('manutencaoano' in dto && dto.manutencaoano !== undefined) {
      entity.manutencaoano = dto.manutencaoano;
    }
    if ('idFazenda' in dto && dto.idFazenda !== undefined) {
      entity.idFazenda = dto.idFazenda;
    }
    if ('idUnidadeMedida' in dto && dto.idUnidadeMedida !== undefined) {
      entity.idUnidadeMedida = dto.idUnidadeMedida;
    }
    if ('idSafra' in dto && dto.idSafra !== undefined) {
      entity.idSafra = dto.idSafra;
    }
    if ('data' in dto && dto.data !== undefined) {
      entity.data = dto.data;
    }
    if ('observacao' in dto && dto.observacao !== undefined) {
      entity.observacao = dto.observacao;
    }

    return entity;
  }

  toDto(entity: Benfeitoria): BenfeitoriaResponseDto {
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

    const dto: BenfeitoriaResponseDto = {
      id_benf: entity.id_benf,
      tenantId: entity.tenantId,
      descricao: entity.descricao,
      valortotal: entity.valortotal != null ? Number(entity.valortotal) : 0,
      vidautil: entity.vidautil,
      percsucata: entity.percsucata != null ? Number(entity.percsucata) : 0,
      depreciacaoano: entity.depreciacaoano != null ? Number(entity.depreciacaoano) : 0,
      taxamanutencao: entity.taxamanutencao != null ? Number(entity.taxamanutencao) : 0,
      manutencaoano: entity.manutencaoano != null ? Number(entity.manutencaoano) : 0,
      idFazenda: entity.idFazenda,
      idUnidadeMedida: entity.idUnidadeMedida,
      idSafra: entity.idSafra,
      data: formatDate((entity as any).data),
      observacao: entity.observacao,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Relacionamentos condicionais
    if ((entity as any).fazenda) {
      dto.fazenda = {
        id: (entity as any).fazenda.id,
        descricao: (entity as any).fazenda.descricao,
      };
    }

    if ((entity as any).unidadeMedida) {
      dto.unidadeMedida = {
        id_unidade: (entity as any).unidadeMedida.id_unidade,
        descricao: (entity as any).unidadeMedida.descricao_unidade || (entity as any).unidadeMedida.descricao,
      };
    }

    if ((entity as any).safra) {
      dto.safra = {
        id: (entity as any).safra.id,
        descricao: (entity as any).safra.descricao,
      };
    }

    if ((entity as any).usuarioCriador) {
      dto.usuarioCriador = {
        id: (entity as any).usuarioCriador.id,
        nome: (entity as any).usuarioCriador.nome,
        email: (entity as any).usuarioCriador.email,
      };
    }

    adicionarCamposFormatados(dto, ['valortotal', 'depreciacaoano', 'manutencaoano']);

    return dto;
  }
}
