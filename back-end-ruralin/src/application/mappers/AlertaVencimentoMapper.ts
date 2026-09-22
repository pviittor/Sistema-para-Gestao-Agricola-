import { Injectable } from '../../core/di';
import AlertaVencimento from '../../models/AlertaVencimento';
import { AlertaVencimentoResponseDto } from '../dto/alertaVencimento';

/**
 * Mapper para conversão entre entidade AlertaVencimento e DTO de resposta
 */
@Injectable()
export class AlertaVencimentoMapper {
  /**
   * Converte entidade AlertaVencimento para AlertaVencimentoResponseDto
   */
  toDto(entity: AlertaVencimento): AlertaVencimentoResponseDto {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      usuarioId: entity.usuarioId,
      alertaVencimentoConfigId: entity.alertaVencimentoConfigId,
      tipoParcela: entity.tipoParcela,
      idParcela: entity.idParcela,
      idTitulo: entity.idTitulo,
      dataVencimentoParcela: entity.dataVencimentoParcela,
      dataAlerta: entity.dataAlerta,
      tipoAlerta: entity.tipoAlerta,
      diasAntecedencia: entity.diasAntecedencia,
      mensagem: entity.mensagem,
      valorSaldo: entity.valorSaldo,
      lido: entity.lido,
      datecreation: entity.datecreation,
      usuario: (entity as any).usuario
        ? {
            id: (entity as any).usuario.id,
            nome: (entity as any).usuario.nome,
            email: (entity as any).usuario.email,
          }
        : null,
      config: (entity as any).config
        ? {
            id: (entity as any).config.id,
            tipoTitulo: (entity as any).config.tipoTitulo,
            ativo: (entity as any).config.ativo,
          }
        : null,
    };
  }
}
