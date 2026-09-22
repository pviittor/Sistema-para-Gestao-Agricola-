import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import CertificadoDigital from '../../models/CertificadoDigital';
import { CreateCertificadoDigitalDto } from '../dto/certificadoDigital/CreateCertificadoDigitalDto';
import { UpdateCertificadoDigitalDto } from '../dto/certificadoDigital/UpdateCertificadoDigitalDto';
import { CertificadoDigitalResponseDto } from '../dto/certificadoDigital/CertificadoDigitalResponseDto';

/**
 * Mapper para entidade CertificadoDigital
 *
 * IMPORTANTE: O campo senha NÃO é incluído no toDto por segurança.
 */
@Injectable()
export class CertificadoDigitalMapper implements IMapper<CertificadoDigital, CertificadoDigitalResponseDto, CreateCertificadoDigitalDto, UpdateCertificadoDigitalDto> {
  async toEntity(dto: CreateCertificadoDigitalDto | UpdateCertificadoDigitalDto): Promise<Partial<CertificadoDigital>> {
    const entity: any = {};

    if ('nome' in dto && dto.nome !== undefined) {
      entity.nome = dto.nome;
    }
    if ('razao_social' in dto && dto.razao_social !== undefined) {
      entity.razao_social = dto.razao_social;
    }
    if ('cnpj_cpf' in dto && dto.cnpj_cpf !== undefined) {
      entity.cnpj_cpf = dto.cnpj_cpf;
    }
    if ('arquivo_path' in dto && dto.arquivo_path !== undefined) {
      entity.arquivo_path = dto.arquivo_path;
    }
    if ('senha' in dto && dto.senha !== undefined) {
      entity.senha = dto.senha;
    }
    if ('data_validade' in dto && dto.data_validade !== undefined) {
      entity.data_validade = dto.data_validade;
    }
    if ('status' in dto && dto.status !== undefined) {
      entity.status = dto.status;
    }
    if ('ambiente' in dto && dto.ambiente !== undefined) {
      entity.ambiente = dto.ambiente;
    }
    if ('uf' in dto && dto.uf !== undefined) {
      entity.uf = dto.uf;
    }
    if ('padrao' in dto && dto.padrao !== undefined) {
      entity.padrao = dto.padrao;
    }
    if ('ativo' in dto && dto.ativo !== undefined) {
      entity.ativo = dto.ativo;
    }

    return entity;
  }

  toDto(entity: CertificadoDigital): CertificadoDigitalResponseDto {
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

    const dto: CertificadoDigitalResponseDto = {
      id: entity.id,
      tenantId: entity.tenantId,
      nome: entity.nome,
      razao_social: entity.razao_social,
      cnpj_cpf: entity.cnpj_cpf,
      arquivo_path: entity.arquivo_path,
      data_validade: formatDate((entity as any).data_validade) ?? '',
      status: entity.status,
      ambiente: entity.ambiente,
      uf: entity.uf,
      padrao: entity.padrao,
      ativo: entity.ativo,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // IMPORTANTE: senha NÃO é incluída na resposta

    return dto;
  }
}
