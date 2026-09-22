import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import Talhao from '../../models/Talhao';
import { CreateTalhaoDto } from '../dto/talhao/CreateTalhaoDto';
import { UpdateTalhaoDto } from '../dto/talhao/UpdateTalhaoDto';
import { TalhaoResponseDto } from '../dto/talhao/TalhaoResponseDto';

/**
 * Mapper para entidade Talhao
 */
@Injectable()
export class TalhaoMapper implements IMapper<Talhao, TalhaoResponseDto, CreateTalhaoDto, UpdateTalhaoDto> {
  async toEntity(dto: CreateTalhaoDto | UpdateTalhaoDto): Promise<Partial<Talhao>> {
    const entity: any = {};

    if ('descricao' in dto && dto.descricao !== undefined) {
      entity.descricao = dto.descricao;
    }
    if ('idFazenda' in dto && dto.idFazenda !== undefined) {
      entity.idFazenda = dto.idFazenda;
    }
    if ('area' in dto && dto.area !== undefined) {
      entity.area = dto.area;
    }
    if ('geometry' in dto && dto.geometry !== undefined) {
      entity.geometry = dto.geometry;
    }
    if ('grupo' in dto && dto.grupo !== undefined) {
      entity.grupo = dto.grupo;
    }

    return entity;
  }

  toDto(entity: Talhao): TalhaoResponseDto {
    const dto: TalhaoResponseDto = {
      id_talhao: entity.id_talhao,
      tenantId: entity.tenantId,
      descricao: entity.descricao,
      idFazenda: entity.idFazenda,
      area: entity.area != null ? Number(entity.area) : 0,
      geometry: entity.geometry || null,
      grupo: entity.grupo || null,
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

    if ((entity as any).usuarioCriador) {
      dto.usuarioCriador = {
        id: (entity as any).usuarioCriador.id,
        nome: (entity as any).usuarioCriador.nome,
        email: (entity as any).usuarioCriador.email,
      };
    }

    // Culturas via ConfiguradorCiclo
    if ((entity as any).configuradoresCiclo && Array.isArray((entity as any).configuradoresCiclo)) {
      dto.culturas = (entity as any).configuradoresCiclo
        .filter((cfg: any) => cfg.cultura)
        .map((cfg: any) => ({
          id: cfg.cultura.id,
          descricao: cfg.cultura.descricao_clt,
          areaPlantada: cfg.areaPlantada != null ? Number(cfg.areaPlantada) : undefined,
        }));
    }

    return dto;
  }
}
