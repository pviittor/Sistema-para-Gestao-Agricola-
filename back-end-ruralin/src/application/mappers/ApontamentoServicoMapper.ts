import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import ApontamentoServico from '../../models/ApontamentoServico';
import { CreateApontamentoServicoDto } from '../dto/apontamentoServico/CreateApontamentoServicoDto';
import { UpdateApontamentoServicoDto } from '../dto/apontamentoServico/UpdateApontamentoServicoDto';
import { ApontamentoServicoResponseDto } from '../dto/apontamentoServico/ApontamentoServicoResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade ApontamentoServico
 */
@Injectable()
export class ApontamentoServicoMapper implements IMapper<ApontamentoServico, ApontamentoServicoResponseDto, CreateApontamentoServicoDto, UpdateApontamentoServicoDto> {
  async toEntity(dto: CreateApontamentoServicoDto | UpdateApontamentoServicoDto): Promise<Partial<ApontamentoServico>> {
    const entity: any = {};

    if ('idApontamento' in dto && dto.idApontamento !== undefined) {
      entity.idApontamento = dto.idApontamento;
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
    if ('idPagar' in dto && dto.idPagar !== undefined) {
      entity.idPagar = dto.idPagar;
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
    if ('quantidadeTon' in dto && dto.quantidadeTon !== undefined) {
      entity.quantidadeTon = dto.quantidadeTon;
    }
    if ('unitarioTon' in dto && dto.unitarioTon !== undefined) {
      entity.unitarioTon = dto.unitarioTon;
    }

    return entity;
  }

  toDto(entity: ApontamentoServico): ApontamentoServicoResponseDto {
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

    const dto: ApontamentoServicoResponseDto = {
      id_aptsrv: entity.id_aptsrv,
      tenantId: entity.tenantId,
      idApontamento: entity.idApontamento,
      idServico: entity.idServico,
      idResponsavel: entity.idResponsavel,
      idMoeda: entity.idMoeda,
      idPagar: entity.idPagar,
      data: formatDate((entity as any).data) || entity.data,
      valor: entity.valor != null ? Number(entity.valor) : 0,
      tempo: entity.tempo != null ? Number(entity.tempo) : 0,
      observacao: entity.observacao,
      quantidadeTon: entity.quantidadeTon != null ? Number(entity.quantidadeTon) : 0,
      unitarioTon: entity.unitarioTon != null ? Number(entity.unitarioTon) : 0,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Relacionamentos condicionais
    if ((entity as any).apontamento) {
      dto.apontamento = {
        id_apt: (entity as any).apontamento.id_apt,
      };
    }

    if ((entity as any).servico) {
      dto.servico = {
        id: (entity as any).servico.id,
        descricao: (entity as any).servico.descricao,
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
        id: (entity as any).moeda.id,
        descricao: (entity as any).moeda.descricao,
      };
    }

    if ((entity as any).tituloPagar) {
      dto.tituloPagar = {
        id: (entity as any).tituloPagar.id,
      };
    }

    if ((entity as any).usuarioCriador) {
      dto.usuarioCriador = {
        id: (entity as any).usuarioCriador.id,
        nome: (entity as any).usuarioCriador.nome,
        email: (entity as any).usuarioCriador.email,
      };
    }

    adicionarCamposFormatados(dto, ['valor', 'unitarioTon']);

    return dto;
  }
}
