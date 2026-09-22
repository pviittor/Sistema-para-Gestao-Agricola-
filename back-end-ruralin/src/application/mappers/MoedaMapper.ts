import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import Moeda from '../../models/Moeda';
import { CreateMoedaDto } from '../dto/moeda/CreateMoedaDto';
import { UpdateMoedaDto } from '../dto/moeda/UpdateMoedaDto';
import { MoedaResponseDto } from '../dto/moeda/MoedaResponseDto';

/**
 * Mapper para entidade Moeda
 */
@Injectable()
export class MoedaMapper implements IMapper<Moeda, MoedaResponseDto, CreateMoedaDto, UpdateMoedaDto> {
  async toEntity(dto: CreateMoedaDto | UpdateMoedaDto): Promise<Partial<Moeda>> {
    const entity: any = {};

    if ('descricao_moeda' in dto && dto.descricao_moeda !== undefined) {
      entity.descricao_moeda = dto.descricao_moeda;
    }
    if ('simbolo_moeda' in dto && dto.simbolo_moeda !== undefined) {
      entity.simbolo_moeda = dto.simbolo_moeda;
    }
    if ('codigoIntegracaoBancoCentral' in dto && dto.codigoIntegracaoBancoCentral !== undefined) {
      entity.codigoIntegracaoBancoCentral = dto.codigoIntegracaoBancoCentral;
    }
    if ('siglabc_moeda' in dto && dto.siglabc_moeda !== undefined) {
      entity.siglabc_moeda = dto.siglabc_moeda;
    }

    return entity;
  }

  toDto(entity: Moeda): MoedaResponseDto {
    const dto: MoedaResponseDto = {
      id_moeda: entity.id_moeda,
      tenantId: entity.tenantId,
      descricao_moeda: entity.descricao_moeda,
      simbolo_moeda: entity.simbolo_moeda,
      codigoIntegracaoBancoCentral: entity.codigoIntegracaoBancoCentral,
      siglabc_moeda: entity.siglabc_moeda,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

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
