import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import ConfiguradorCiclo from '../../models/ConfiguradorCiclo';
import { CreateConfiguradorCicloDto } from '../dto/configuradorCiclo/CreateConfiguradorCicloDto';
import { UpdateConfiguradorCicloDto } from '../dto/configuradorCiclo/UpdateConfiguradorCicloDto';
import { ConfiguradorCicloResponseDto } from '../dto/configuradorCiclo/ConfiguradorCicloResponseDto';

/**
 * Mapper para entidade ConfiguradorCiclo
 */
@Injectable()
export class ConfiguradorCicloMapper implements IMapper<ConfiguradorCiclo, ConfiguradorCicloResponseDto, CreateConfiguradorCicloDto, UpdateConfiguradorCicloDto> {
  async toEntity(dto: CreateConfiguradorCicloDto | UpdateConfiguradorCicloDto): Promise<Partial<ConfiguradorCiclo>> {
    const entity: any = {};

    if ('idTalhao' in dto && dto.idTalhao !== undefined) {
      entity.idTalhao = dto.idTalhao;
    }
    if ('idCiclo' in dto && dto.idCiclo !== undefined) {
      entity.idCiclo = dto.idCiclo;
    }
    if ('idCultura' in dto && dto.idCultura !== undefined) {
      entity.idCultura = dto.idCultura;
    }
    if ('idVariedadeCiclo' in dto && dto.idVariedadeCiclo !== undefined) {
      entity.idVariedadeCiclo = dto.idVariedadeCiclo;
    }
    if ('inicioPlantio' in dto && dto.inicioPlantio !== undefined) {
      entity.inicioPlantio = dto.inicioPlantio;
    }
    if ('fimPlantio' in dto && dto.fimPlantio !== undefined) {
      entity.fimPlantio = dto.fimPlantio;
    }
    if ('previsaoColheita' in dto && dto.previsaoColheita !== undefined) {
      entity.previsaoColheita = dto.previsaoColheita;
    }
    if ('inicioColheita' in dto && dto.inicioColheita !== undefined) {
      entity.inicioColheita = dto.inicioColheita;
    }
    if ('fimColheita' in dto && dto.fimColheita !== undefined) {
      entity.fimColheita = dto.fimColheita;
    }
    if ('observacao' in dto && dto.observacao !== undefined) {
      entity.observacao = dto.observacao;
    }
    if ('areaPlantada' in dto && dto.areaPlantada !== undefined) {
      entity.areaPlantada = dto.areaPlantada;
    }
    if ('estimativaProducao' in dto && dto.estimativaProducao !== undefined) {
      entity.estimativaProducao = dto.estimativaProducao;
    }

    return entity;
  }

  toDto(entity: ConfiguradorCiclo): ConfiguradorCicloResponseDto {
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

    const dto: ConfiguradorCicloResponseDto = {
      id_cfg: entity.id_cfg,
      tenantId: entity.tenantId,
      idTalhao: entity.idTalhao,
      idCiclo: entity.idCiclo,
      idCultura: entity.idCultura,
      idVariedadeCiclo: entity.idVariedadeCiclo,
      inicioPlantio: formatDate((entity as any).inicioPlantio),
      fimPlantio: formatDate((entity as any).fimPlantio),
      previsaoColheita: formatDate((entity as any).previsaoColheita),
      inicioColheita: formatDate((entity as any).inicioColheita),
      fimColheita: formatDate((entity as any).fimColheita),
      observacao: entity.observacao,
      areaPlantada: entity.areaPlantada != null ? Number(entity.areaPlantada) : null,
      estimativaProducao: entity.estimativaProducao != null ? Number(entity.estimativaProducao) : null,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Relacionamentos condicionais
    if ((entity as any).talhao) {
      dto.talhao = {
        id_talhao: (entity as any).talhao.id_talhao,
        descricao: (entity as any).talhao.descricao,
      };
    }

    if ((entity as any).ciclo) {
      dto.ciclo = {
        id: (entity as any).ciclo.id,
        descricao: (entity as any).ciclo.descricao,
      };
    }

    if ((entity as any).cultura) {
      dto.cultura = {
        id: (entity as any).cultura.id,
        descricao: (entity as any).cultura.descricao,
      };
    }

    if ((entity as any).variedadeCiclo) {
      dto.variedadeCiclo = {
        id_prod: (entity as any).variedadeCiclo.id_prod,
        descricao_prod: (entity as any).variedadeCiclo.descricao_prod,
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
