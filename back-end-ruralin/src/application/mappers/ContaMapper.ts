import { Injectable } from '../../core/di';
import Conta from '../../models/Conta';
import { CreateContaDto, UpdateContaDto, ContaResponseDto } from '../dto/conta';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para conversão entre DTOs e entidade Conta
 */
@Injectable()
export class ContaMapper {
  /**
   * Converte CreateContaDto para entidade Conta
   */
  toEntity(dto: CreateContaDto, userId: number, tenantId: number): Partial<Conta> {
    return {
      bancoId: dto.bancoId,
      nome: dto.nome,
      agencia: dto.agencia || null,
      conta: dto.conta || null,
      tipo: dto.tipo,
      saldoInicial: dto.saldoInicial ?? 0,
      ativo: dto.ativo ?? true,
      tenantId,
      usercreation: userId,
    };
  }

  /**
   * Converte UpdateContaDto para entidade Conta
   */
  toUpdateEntity(dto: UpdateContaDto): Partial<Conta> {
    const entity: Partial<Conta> = {};

    if (dto.bancoId !== undefined) {
      entity.bancoId = dto.bancoId;
    }
    if (dto.nome !== undefined) {
      entity.nome = dto.nome;
    }
    if (dto.agencia !== undefined) {
      entity.agencia = dto.agencia || null;
    }
    if (dto.conta !== undefined) {
      entity.conta = dto.conta || null;
    }
    if (dto.tipo !== undefined) {
      entity.tipo = dto.tipo;
    }
    if (dto.saldoInicial !== undefined) {
      entity.saldoInicial = dto.saldoInicial;
    }
    if (dto.ativo !== undefined) {
      entity.ativo = dto.ativo;
    }

    return entity;
  }

  /**
   * Converte entidade Conta para ContaResponseDto
   */
  toDto(entity: Conta): ContaResponseDto {
    const dto: any = {
      id: entity.id,
      tenantId: entity.tenantId,
      bancoId: entity.bancoId,
      nome: entity.nome,
      agencia: entity.agencia,
      conta: entity.conta,
      tipo: entity.tipo,
      saldoInicial: Number(entity.saldoInicial),
      ativo: entity.ativo,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
      banco: (entity as any).banco
        ? {
            id: (entity as any).banco.id,
            codigo: (entity as any).banco.codigo,
            nome: (entity as any).banco.nome,
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

    adicionarCamposFormatados(dto, ['saldoInicial']);

    return dto;
  }
}
