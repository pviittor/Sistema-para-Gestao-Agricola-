import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import AtividadeOperacao from '../../models/AtividadeOperacao';
import { CreateAtividadeOperacaoDto } from '../dto/atividadeOperacao/CreateAtividadeOperacaoDto';
import { UpdateAtividadeOperacaoDto } from '../dto/atividadeOperacao/UpdateAtividadeOperacaoDto';
import { AtividadeOperacaoResponseDto } from '../dto/atividadeOperacao/AtividadeOperacaoResponseDto';

/**
 * Mapper para entidade AtividadeOperacao
 */
@Injectable()
export class AtividadeOperacaoMapper implements IMapper<AtividadeOperacao, AtividadeOperacaoResponseDto, CreateAtividadeOperacaoDto, UpdateAtividadeOperacaoDto> {
  async toEntity(dto: CreateAtividadeOperacaoDto | UpdateAtividadeOperacaoDto): Promise<Partial<AtividadeOperacao>> {
    const entity: any = {};

    if ('descricao' in dto && dto.descricao !== undefined) {
      entity.descricao = dto.descricao;
    }
    if ('idAtividade' in dto && dto.idAtividade !== undefined) {
      entity.idAtividade = dto.idAtividade;
    }
    if ('financeiro' in dto && dto.financeiro !== undefined) {
      entity.financeiro = dto.financeiro;
    }

    return entity;
  }

  toDto(entity: AtividadeOperacao): AtividadeOperacaoResponseDto {
    const dto: AtividadeOperacaoResponseDto = {
      id_op: entity.id_op,
      tenantId: entity.tenantId,
      descricao: entity.descricao,
      idAtividade: entity.idAtividade,
      financeiro: entity.financeiro,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Relacionamentos condicionais
    if ((entity as any).atividadeAgricola) {
      dto.atividadeAgricola = {
        id_atv: (entity as any).atividadeAgricola.id_atv,
        descricao: (entity as any).atividadeAgricola.descricao,
        tipo: (entity as any).atividadeAgricola.tipo,
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
