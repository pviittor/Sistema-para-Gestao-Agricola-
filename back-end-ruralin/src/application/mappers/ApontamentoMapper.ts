import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import Apontamento from '../../models/Apontamento';
import { CreateApontamentoDto } from '../dto/apontamento/CreateApontamentoDto';
import { UpdateApontamentoDto } from '../dto/apontamento/UpdateApontamentoDto';
import { ApontamentoResponseDto } from '../dto/apontamento/ApontamentoResponseDto';

/**
 * Mapper para entidade Apontamento
 */
@Injectable()
export class ApontamentoMapper implements IMapper<Apontamento, ApontamentoResponseDto, CreateApontamentoDto, UpdateApontamentoDto> {
  async toEntity(dto: CreateApontamentoDto | UpdateApontamentoDto): Promise<Partial<Apontamento>> {
    const entity: any = {};

    if ('idConfiguracao' in dto && dto.idConfiguracao !== undefined) {
      entity.idConfiguracao = dto.idConfiguracao;
    }
    if ('idAtividade' in dto && dto.idAtividade !== undefined) {
      entity.idAtividade = dto.idAtividade;
    }
    if ('idOperacao' in dto && dto.idOperacao !== undefined) {
      entity.idOperacao = dto.idOperacao;
    }
    if ('dataInicio' in dto && dto.dataInicio !== undefined) {
      entity.dataInicio = dto.dataInicio;
    }

    return entity;
  }

  toDto(entity: Apontamento): ApontamentoResponseDto {
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

    const dto: ApontamentoResponseDto = {
      id_apt: entity.id_apt,
      tenantId: entity.tenantId,
      idConfiguracao: entity.idConfiguracao,
      idAtividade: entity.idAtividade,
      idOperacao: entity.idOperacao,
      dataInicio: formatDate((entity as any).dataInicio),
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Relacionamentos condicionais
    if ((entity as any).configuracao) {
      dto.configuracao = {
        id_cfg: (entity as any).configuracao.id_cfg,
        descricao: (entity as any).configuracao.descricao,
      };
    }

    if ((entity as any).atividade) {
      dto.atividade = {
        id_atv: (entity as any).atividade.id_atv,
        descricao: (entity as any).atividade.descricao,
      };
    }

    if ((entity as any).operacao) {
      dto.operacao = {
        id_op: (entity as any).operacao.id_op,
        descricao: (entity as any).operacao.descricao,
      };
    }

    if ((entity as any).usuarioCriador) {
      dto.usuarioCriador = {
        id: (entity as any).usuarioCriador.id,
        nome: (entity as any).usuarioCriador.nome,
        email: (entity as any).usuarioCriador.email,
      };
    }

    return dto;
  }
}
