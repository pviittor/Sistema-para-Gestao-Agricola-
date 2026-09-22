import { Injectable } from '../../core/di';
import AlertaVencimentoConfig from '../../models/AlertaVencimentoConfig';
import { CreateAlertaVencimentoConfigDto, UpdateAlertaVencimentoConfigDto, AlertaVencimentoConfigResponseDto } from '../dto/alertaVencimentoConfig';

/**
 * Mapper para conversão entre DTOs e entidade AlertaVencimentoConfig
 */
@Injectable()
export class AlertaVencimentoConfigMapper {
  /**
   * Converte CreateAlertaVencimentoConfigDto para entidade AlertaVencimentoConfig
   */
  toEntity(dto: CreateAlertaVencimentoConfigDto, userId: number, tenantId: number): Partial<AlertaVencimentoConfig> {
    return {
      tenantId,
      tipoTitulo: dto.tipoTitulo as any,
      antecedenciaAlerta1Dias: dto.antecedenciaAlerta1Dias !== undefined ? dto.antecedenciaAlerta1Dias : 7,
      antecedenciaAlerta2Dias: dto.antecedenciaAlerta2Dias !== undefined ? dto.antecedenciaAlerta2Dias : 3,
      antecedenciaAlerta3Dias: dto.antecedenciaAlerta3Dias !== undefined ? dto.antecedenciaAlerta3Dias : 1,
      notificarNoVencimento: dto.notificarNoVencimento !== undefined ? dto.notificarNoVencimento : true,
      notificarVencidos: dto.notificarVencidos !== undefined ? dto.notificarVencidos : true,
      frequenciaRenotificacaoVencidosDias: dto.frequenciaRenotificacaoVencidosDias !== undefined ? dto.frequenciaRenotificacaoVencidosDias : 3,
      ativo: dto.ativo !== undefined ? dto.ativo : true,
      usercreation: userId,
    };
  }

  /**
   * Converte UpdateAlertaVencimentoConfigDto para entidade AlertaVencimentoConfig
   */
  toUpdateEntity(dto: UpdateAlertaVencimentoConfigDto): Partial<AlertaVencimentoConfig> {
    const entity: Partial<AlertaVencimentoConfig> = {};

    if (dto.tipoTitulo !== undefined) {
      entity.tipoTitulo = dto.tipoTitulo as any;
    }
    if (dto.antecedenciaAlerta1Dias !== undefined) {
      entity.antecedenciaAlerta1Dias = dto.antecedenciaAlerta1Dias;
    }
    if (dto.antecedenciaAlerta2Dias !== undefined) {
      entity.antecedenciaAlerta2Dias = dto.antecedenciaAlerta2Dias;
    }
    if (dto.antecedenciaAlerta3Dias !== undefined) {
      entity.antecedenciaAlerta3Dias = dto.antecedenciaAlerta3Dias;
    }
    if (dto.notificarNoVencimento !== undefined) {
      entity.notificarNoVencimento = dto.notificarNoVencimento;
    }
    if (dto.notificarVencidos !== undefined) {
      entity.notificarVencidos = dto.notificarVencidos;
    }
    if (dto.frequenciaRenotificacaoVencidosDias !== undefined) {
      entity.frequenciaRenotificacaoVencidosDias = dto.frequenciaRenotificacaoVencidosDias;
    }
    if (dto.ativo !== undefined) {
      entity.ativo = dto.ativo;
    }

    return entity;
  }

  /**
   * Converte entidade AlertaVencimentoConfig para AlertaVencimentoConfigResponseDto
   */
  toDto(entity: AlertaVencimentoConfig): AlertaVencimentoConfigResponseDto {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      usuarioId: entity.usuarioId,
      tipoTitulo: entity.tipoTitulo,
      antecedenciaAlerta1Dias: entity.antecedenciaAlerta1Dias,
      antecedenciaAlerta2Dias: entity.antecedenciaAlerta2Dias,
      antecedenciaAlerta3Dias: entity.antecedenciaAlerta3Dias,
      notificarNoVencimento: entity.notificarNoVencimento,
      notificarVencidos: entity.notificarVencidos,
      frequenciaRenotificacaoVencidosDias: entity.frequenciaRenotificacaoVencidosDias,
      ativo: entity.ativo,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
      usuario: (entity as any).usuario
        ? {
            id: (entity as any).usuario.id,
            nome: (entity as any).usuario.nome,
            email: (entity as any).usuario.email,
          }
        : null,
      usuarioCriador: (entity as any).usuarioCriador
        ? {
            id: (entity as any).usuarioCriador.id,
            nome: (entity as any).usuarioCriador.nome,
            email: (entity as any).usuarioCriador.email,
          }
        : null,
    };
  }
}
