import { Injectable } from '../../core/di';
import Recibo from '../../models/Recibo';
import { ReciboResponseDto } from '../dto/recibo';

@Injectable()
export class ReciboMapper {
  toEntity(dto: any): Partial<Recibo> {
    return {
      nomeEmitente: dto.nomeEmitente,
      documentoEmitente: dto.documentoEmitente,
      nomeBeneficiario: dto.nomeBeneficiario,
      documentoBeneficiario: dto.documentoBeneficiario,
      valor: dto.valor,
      descricao: dto.descricao,
      formaPagamento: dto.formaPagamento,
      dataEmissao: dto.dataEmissao,
      local: dto.local,
      observacoes: dto.observacoes,
      tipoVinculo: dto.tipoVinculo,
      tituloPagarId: dto.tituloPagarId,
      tituloReceberId: dto.tituloReceberId,
      parcelaId: dto.parcelaId,
    } as Partial<Recibo>;
  }

  toResponseDto(entity: Recibo): ReciboResponseDto {
    const dto = new ReciboResponseDto();
    dto.id = entity.id;
    dto.tenantId = entity.tenantId;
    dto.serie = entity.serie;
    dto.numero = entity.numero;
    dto.numeroFormatado = entity.numeroFormatado;
    dto.nomeEmitente = entity.nomeEmitente;
    dto.documentoEmitente = entity.documentoEmitente;
    dto.nomeBeneficiario = entity.nomeBeneficiario;
    dto.documentoBeneficiario = entity.documentoBeneficiario;
    dto.valor = entity.valor;
    dto.valorExtenso = entity.valorExtenso;
    dto.descricao = entity.descricao;
    dto.formaPagamento = entity.formaPagamento;
    dto.dataEmissao = entity.dataEmissao;
    dto.local = entity.local;
    dto.observacoes = entity.observacoes;
    dto.status = entity.status;
    dto.motivoCancelamento = entity.motivoCancelamento;
    dto.usuarioCancelamentoId = entity.usuarioCancelamentoId;
    dto.dataCancelamento = entity.dataCancelamento;
    dto.tipoVinculo = entity.tipoVinculo;
    dto.tituloPagarId = entity.tituloPagarId;
    dto.tituloReceberId = entity.tituloReceberId;
    dto.parcelaId = entity.parcelaId;
    dto.quantidadeImpressoes = entity.quantidadeImpressoes;
    dto.usercreation = entity.usercreation;
    dto.createdAt = entity.createdAt?.toISOString?.() || String(entity.createdAt);
    dto.updatedAt = entity.updatedAt?.toISOString?.() || String(entity.updatedAt);

    // Map associations if present
    if ((entity as any).tituloPagar) {
      dto.tituloPagar = (entity as any).tituloPagar;
    }
    if ((entity as any).tituloReceber) {
      dto.tituloReceber = (entity as any).tituloReceber;
    }

    return dto;
  }
}
