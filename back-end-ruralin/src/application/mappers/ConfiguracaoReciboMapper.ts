import { Injectable } from '../../core/di';
import ConfiguracaoRecibo from '../../models/ConfiguracaoRecibo';
import { ConfiguracaoReciboResponseDto } from '../dto/configuracaoRecibo';

@Injectable()
export class ConfiguracaoReciboMapper {
  toEntity(dto: any): Partial<ConfiguracaoRecibo> {
    return {
      nomePropriedade: dto.nomePropriedade,
      cnpjCpf: dto.cnpjCpf,
      inscricaoEstadual: dto.inscricaoEstadual,
      endereco: dto.endereco,
      telefone: dto.telefone,
      logoBase64: dto.logoBase64,
      observacaoPadrao: dto.observacaoPadrao,
      localPadrao: dto.localPadrao,
      ativo: dto.ativo ?? true,
    } as Partial<ConfiguracaoRecibo>;
  }

  toResponseDto(entity: ConfiguracaoRecibo): ConfiguracaoReciboResponseDto {
    const dto = new ConfiguracaoReciboResponseDto();
    dto.id = entity.id;
    dto.tenantId = entity.tenantId;
    dto.nomePropriedade = entity.nomePropriedade;
    dto.cnpjCpf = entity.cnpjCpf;
    dto.inscricaoEstadual = entity.inscricaoEstadual;
    dto.endereco = entity.endereco;
    dto.telefone = entity.telefone;
    dto.logoBase64 = entity.logoBase64;
    dto.observacaoPadrao = entity.observacaoPadrao;
    dto.localPadrao = entity.localPadrao;
    dto.ativo = entity.ativo;
    dto.createdAt = entity.createdAt?.toISOString?.() || String(entity.createdAt);
    dto.updatedAt = entity.updatedAt?.toISOString?.() || String(entity.updatedAt);
    return dto;
  }
}
