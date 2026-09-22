import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import MoedaCotacao from '../../models/MoedaCotacao';
import { CreateMoedaCotacaoDto } from '../dto/moedaCotacao/CreateMoedaCotacaoDto';
import { UpdateMoedaCotacaoDto } from '../dto/moedaCotacao/UpdateMoedaCotacaoDto';
import { MoedaCotacaoResponseDto } from '../dto/moedaCotacao/MoedaCotacaoResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade MoedaCotacao
 */
@Injectable()
export class MoedaCotacaoMapper implements IMapper<MoedaCotacao, MoedaCotacaoResponseDto, CreateMoedaCotacaoDto, UpdateMoedaCotacaoDto> {
  async toEntity(dto: CreateMoedaCotacaoDto | UpdateMoedaCotacaoDto): Promise<Partial<MoedaCotacao>> {
    const entity: any = {};

    if ('idMoeda' in dto && dto.idMoeda !== undefined) {
      entity.idMoeda = dto.idMoeda;
    }
    if ('data_cotacao' in dto && dto.data_cotacao !== undefined) {
      // data_cotacao sempre vem como string do DTO (IsDateString)
      entity.data_cotacao = dto.data_cotacao as string;
    }
    if ('valor_cotacao' in dto && dto.valor_cotacao !== undefined) {
      entity.valor_cotacao = dto.valor_cotacao;
    }
    if ('fechamento_cotaca' in dto && dto.fechamento_cotaca !== undefined) {
      entity.fechamento_cotaca = dto.fechamento_cotaca;
    }

    return entity;
  }

  toDto(entity: MoedaCotacao): MoedaCotacaoResponseDto {
    const dto: MoedaCotacaoResponseDto = {
      id_cotacao: entity.id_cotacao,
      tenantId: entity.tenantId,
      idMoeda: entity.idMoeda,
      data_cotacao: entity.data_cotacao,
      valor_cotacao: Number(entity.valor_cotacao),
      fechamento_cotaca: entity.fechamento_cotaca,
    };

    if ((entity as any).moeda) {
      dto.moeda = {
        id_moeda: (entity as any).moeda.id_moeda,
        descricao_moeda: (entity as any).moeda.descricao_moeda,
        simbolo_moeda: (entity as any).moeda.simbolo_moeda,
        siglabc_moeda: (entity as any).moeda.siglabc_moeda,
      };
    }

    adicionarCamposFormatados(dto, ['valor_cotacao']);

    return dto;
  }
}
