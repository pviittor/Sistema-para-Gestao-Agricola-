import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import ServicoBenfeitoria from '../../models/ServicoBenfeitoria';
import { CreateServicoBenfeitoriaDto } from '../dto/servicoBenfeitoria/CreateServicoBenfeitoriaDto';
import { UpdateServicoBenfeitoriaDto } from '../dto/servicoBenfeitoria/UpdateServicoBenfeitoriaDto';
import { ServicoBenfeitoriaResponseDto } from '../dto/servicoBenfeitoria/ServicoBenfeitoriaResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade ServicoBenfeitoria
 */
@Injectable()
export class ServicoBenfeitoriaMapper implements IMapper<ServicoBenfeitoria, ServicoBenfeitoriaResponseDto, CreateServicoBenfeitoriaDto, UpdateServicoBenfeitoriaDto> {
  async toEntity(dto: CreateServicoBenfeitoriaDto | UpdateServicoBenfeitoriaDto): Promise<Partial<ServicoBenfeitoria>> {
    const entity: any = {};

    if ('idBenfeitoria' in dto && dto.idBenfeitoria !== undefined) {
      entity.idBenfeitoria = dto.idBenfeitoria;
    }
    if ('idServico' in dto && dto.idServico !== undefined) {
      entity.idServico = dto.idServico;
    }
    if ('idResponsavel' in dto && dto.idResponsavel !== undefined) {
      entity.idResponsavel = dto.idResponsavel;
    }
    if ('idMoeda' in dto && dto.idMoeda !== undefined) {
      entity.idMoeda = dto.idMoeda;
    }
    if ('data' in dto && dto.data !== undefined) {
      entity.data = dto.data;
    }
    if ('valor' in dto && dto.valor !== undefined) {
      entity.valor = dto.valor;
    }
    if ('tempo' in dto && dto.tempo !== undefined) {
      entity.tempo = dto.tempo;
    }
    if ('observacao' in dto && dto.observacao !== undefined) {
      entity.observacao = dto.observacao;
    }
    if ('idSafra' in dto && dto.idSafra !== undefined) {
      entity.idSafra = dto.idSafra;
    }

    return entity;
  }

  toDto(entity: ServicoBenfeitoria): ServicoBenfeitoriaResponseDto {
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

    const dto: ServicoBenfeitoriaResponseDto = {
      id_srvbenf: entity.id_srvbenf,
      tenantId: entity.tenantId,
      idBenfeitoria: entity.idBenfeitoria,
      idServico: entity.idServico,
      idResponsavel: entity.idResponsavel,
      idMoeda: entity.idMoeda,
      idPagar: entity.idPagar,
      data: formatDate((entity as any).data) || entity.data,
      valor: entity.valor != null ? Number(entity.valor) : 0,
      tempo: entity.tempo != null ? Number(entity.tempo) : 0,
      observacao: entity.observacao,
      idSafra: entity.idSafra,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Relacionamentos condicionais
    if ((entity as any).benfeitoria) {
      dto.benfeitoria = {
        id_benf: (entity as any).benfeitoria.id_benf,
        descricao: (entity as any).benfeitoria.descricao,
      };
    }

    if ((entity as any).servico) {
      dto.servico = {
        id_srv: (entity as any).servico.id_srv,
        descricao_srv: (entity as any).servico.descricao_srv,
      };
    }

    if ((entity as any).responsavel) {
      dto.responsavel = {
        id_pessoa: (entity as any).responsavel.id_pessoa,
        nomerazao_pessoa: (entity as any).responsavel.nomerazao_pessoa,
      };
    }

    if ((entity as any).moeda) {
      dto.moeda = {
        id_moeda: (entity as any).moeda.id_moeda,
        descricao: (entity as any).moeda.descricao,
      };
    }

    if ((entity as any).tituloPagar) {
      dto.tituloPagar = {
        id: (entity as any).tituloPagar.id,
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

    adicionarCamposFormatados(dto, ['valor']);

    return dto;
  }
}
