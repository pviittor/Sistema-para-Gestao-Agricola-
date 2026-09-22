import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import GrupoEquipamento from '../../models/GrupoEquipamento';
import { CreateGrupoEquipamentoDto } from '../dto/grupoEquipamento/CreateGrupoEquipamentoDto';
import { UpdateGrupoEquipamentoDto } from '../dto/grupoEquipamento/UpdateGrupoEquipamentoDto';
import { GrupoEquipamentoResponseDto } from '../dto/grupoEquipamento/GrupoEquipamentoResponseDto';

/**
 * Mapper para entidade GrupoEquipamento
 *
 * Implementa conversão entre DTOs e entidades, garantindo que:
 * - Campos opcionais sejam tratados corretamente
 */
@Injectable()
export class GrupoEquipamentoMapper implements IMapper<GrupoEquipamento, GrupoEquipamentoResponseDto, CreateGrupoEquipamentoDto, UpdateGrupoEquipamentoDto> {
  /**
   * Converte DTO para entidade do domínio
   *
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreateGrupoEquipamentoDto | UpdateGrupoEquipamentoDto): Promise<Partial<GrupoEquipamento>> {
    const entity: any = {};

    if ('descricao_grpequip' in dto && dto.descricao_grpequip !== undefined) {
      entity.descricao_grpequip = dto.descricao_grpequip;
    }

    return entity;
  }

  /**
   * Converte entidade para DTO de resposta
   *
   * @param entity - Entidade do domínio
   * @returns DTO de resposta
   */
  toDto(entity: GrupoEquipamento): GrupoEquipamentoResponseDto {
    const dto: GrupoEquipamentoResponseDto = {
      id_grpequip: entity.id_grpequip,
      tenantId: entity.tenantId,
      descricao_grpequip: entity.descricao_grpequip,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    return dto;
  }
}
