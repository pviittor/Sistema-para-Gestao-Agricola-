/**
 * LancamentoRecorrenteMapper - Mapper para entidade LancamentoRecorrente
 *
 * Responsavel por converter entre DTOs e entidades do dominio para LancamentoRecorrente.
 *
 * Regras importantes:
 * - Converter datas corretamente (dataReferencia, dataVencimentoGerado)
 * - Tratar campos opcionais corretamente
 * - Preservar valores numericos
 * - Mapear relacionamentos quando incluidos
 */

import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import LancamentoRecorrente from '../../models/LancamentoRecorrente';
import { CreateLancamentoRecorrenteDto } from '../dto/lancamentoRecorrente/CreateLancamentoRecorrenteDto';
import { LancamentoRecorrenteResponseDto } from '../dto/lancamentoRecorrente/LancamentoRecorrenteResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

// Helper function to format dates safely
const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '';
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
  return '';
};

@Injectable()
export class LancamentoRecorrenteMapper implements IMapper<LancamentoRecorrente, LancamentoRecorrenteResponseDto, CreateLancamentoRecorrenteDto, CreateLancamentoRecorrenteDto> {
  /**
   * Converte DTO para entidade do dominio
   *
   * @param dto - DTO de criacao
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreateLancamentoRecorrenteDto): Promise<Partial<LancamentoRecorrente>> {
    const entity: any = {};

    // Campos de relacionamento (FKs)
    if ('recorrenciaFinanceiraId' in dto && dto.recorrenciaFinanceiraId !== undefined) entity.recorrenciaFinanceiraId = dto.recorrenciaFinanceiraId;
    if ('tituloPagarId' in dto && dto.tituloPagarId !== undefined) entity.tituloPagarId = dto.tituloPagarId;
    if ('tituloReceberId' in dto && dto.tituloReceberId !== undefined) entity.tituloReceberId = dto.tituloReceberId;

    // Campos de data
    if ('dataReferencia' in dto && dto.dataReferencia !== undefined) {
      entity.dataReferencia = dto.dataReferencia;
    }
    if ('dataVencimentoGerado' in dto && dto.dataVencimentoGerado !== undefined) {
      entity.dataVencimentoGerado = dto.dataVencimentoGerado;
    }

    // Campos numericos
    if ('valorGerado' in dto && dto.valorGerado !== undefined) entity.valorGerado = dto.valorGerado;

    // Campos enum
    if ('status' in dto && dto.status !== undefined) entity.status = dto.status;

    // Campos de texto
    if ('observacao' in dto && dto.observacao !== undefined) entity.observacao = dto.observacao;

    return entity;
  }

  /**
   * Converte entidade do dominio para DTO
   *
   * @param entity - Entidade do dominio
   * @returns DTO de resposta
   */
  toDto(entity: LancamentoRecorrente): LancamentoRecorrenteResponseDto {
    const dto: LancamentoRecorrenteResponseDto = {
      id: entity.id,
      tenantId: entity.tenantId,
      recorrenciaFinanceiraId: entity.recorrenciaFinanceiraId,
      tituloPagarId: entity.tituloPagarId,
      tituloReceberId: entity.tituloReceberId,
      dataReferencia: formatDate((entity as any).dataReferencia),
      dataVencimentoGerado: formatDate((entity as any).dataVencimentoGerado),
      valorGerado: entity.valorGerado,
      status: entity.status,
      observacao: entity.observacao,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Mapear relacionamentos quando disponiveis
    if (entity.recorrencia) {
      dto.recorrencia = {
        id: entity.recorrencia.id,
        descricao: entity.recorrencia.descricao,
        tipo: entity.recorrencia.tipo,
        periodicidade: entity.recorrencia.periodicidade,
        valor: entity.recorrencia.valor,
        ativa: entity.recorrencia.ativa,
      };
    }

    if (entity.tituloPagar) {
      dto.tituloPagar = {
        id: entity.tituloPagar.id,
        numeroTitulo: entity.tituloPagar.numeroTitulo,
        valorTitulo: entity.tituloPagar.valorTitulo,
        dataLancamento: formatDate((entity.tituloPagar as any).dataLancamento),
        status: entity.tituloPagar.status,
      };
    }

    if (entity.tituloReceber) {
      dto.tituloReceber = {
        id: entity.tituloReceber.id,
        numeroTitulo: (entity.tituloReceber as any).numeroTitulo,
        valorTitulo: (entity.tituloReceber as any).valorTitulo,
        dataLancamento: formatDate((entity.tituloReceber as any).dataLancamento),
        status: (entity.tituloReceber as any).status,
      };
    }

    if ((entity as any).usuarioCriador) {
      dto.usuarioCriador = {
        id: (entity as any).usuarioCriador.id,
        nome: (entity as any).usuarioCriador.nome,
        email: (entity as any).usuarioCriador.email,
      };
    }

    adicionarCamposFormatados(dto, ['valorGerado']);

    return dto;
  }
}
