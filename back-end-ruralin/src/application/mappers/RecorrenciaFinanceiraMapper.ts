/**
 * RecorrenciaFinanceiraMapper - Mapper para entidade RecorrenciaFinanceira
 *
 * Responsável por converter entre DTOs e entidades do domínio para RecorrenciaFinanceira.
 *
 * Regras importantes:
 * - Converter datas corretamente (dataInicio, dataFim)
 * - Tratar campos opcionais corretamente
 * - Preservar valores numéricos e booleanos
 * - Mapear relacionamentos quando incluídos
 */

import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import RecorrenciaFinanceira from '../../models/RecorrenciaFinanceira';
import { CreateRecorrenciaFinanceiraDto } from '../dto/recorrenciaFinanceira/CreateRecorrenciaFinanceiraDto';
import { UpdateRecorrenciaFinanceiraDto } from '../dto/recorrenciaFinanceira/UpdateRecorrenciaFinanceiraDto';
import { RecorrenciaFinanceiraResponseDto } from '../dto/recorrenciaFinanceira/RecorrenciaFinanceiraResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade RecorrenciaFinanceira
 *
 * Implementa conversão entre DTOs e entidades, garantindo que:
 * - Datas sejam convertidas corretamente
 * - Campos opcionais sejam tratados corretamente
 * - Valores booleanos sejam preservados
 * - Relacionamentos sejam mapeados quando disponíveis
 */
@Injectable()
export class RecorrenciaFinanceiraMapper implements IMapper<RecorrenciaFinanceira, RecorrenciaFinanceiraResponseDto, CreateRecorrenciaFinanceiraDto, UpdateRecorrenciaFinanceiraDto> {
  /**
   * Converte DTO para entidade do domínio
   *
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreateRecorrenciaFinanceiraDto | UpdateRecorrenciaFinanceiraDto): Promise<Partial<RecorrenciaFinanceira>> {
    const entity: any = {};

    // Campos de texto
    if ('tipo' in dto && dto.tipo !== undefined) entity.tipo = dto.tipo;
    if ('descricao' in dto && dto.descricao !== undefined) entity.descricao = dto.descricao;
    if ('periodicidade' in dto && dto.periodicidade !== undefined) entity.periodicidade = dto.periodicidade;
    if ('observacao' in dto && dto.observacao !== undefined) entity.observacao = dto.observacao;

    // Campos numéricos
    if ('valor' in dto && dto.valor !== undefined) entity.valor = dto.valor;
    if ('diaVencimento' in dto && dto.diaVencimento !== undefined) entity.diaVencimento = dto.diaVencimento;
    if ('antecedenciaGeracaoDias' in dto && dto.antecedenciaGeracaoDias !== undefined) entity.antecedenciaGeracaoDias = dto.antecedenciaGeracaoDias;
    if ('numeroMaximoGeracoes' in dto && dto.numeroMaximoGeracoes !== undefined) entity.numeroMaximoGeracoes = dto.numeroMaximoGeracoes;

    // Campos de data
    if ('dataInicio' in dto && dto.dataInicio !== undefined) {
      entity.dataInicio = dto.dataInicio ? new Date(dto.dataInicio) : null;
    }
    if ('dataFim' in dto && dto.dataFim !== undefined) {
      entity.dataFim = dto.dataFim ? new Date(dto.dataFim) : null;
    }

    // Campos booleanos
    if ('ativa' in dto && (dto as UpdateRecorrenciaFinanceiraDto).ativa !== undefined) {
      entity.ativa = (dto as UpdateRecorrenciaFinanceiraDto).ativa;
    }

    // Campos de relacionamento (FKs)
    if ('idFornecedorCliente' in dto && dto.idFornecedorCliente !== undefined) entity.idFornecedorCliente = dto.idFornecedorCliente;
    if ('idPortador' in dto && dto.idPortador !== undefined) entity.idPortador = dto.idPortador;
    if ('idProdutor' in dto && dto.idProdutor !== undefined) entity.idProdutor = dto.idProdutor;
    if ('idContaDebCred' in dto && dto.idContaDebCred !== undefined) entity.idContaDebCred = dto.idContaDebCred;
    if ('idPlanoContaGerencial' in dto && dto.idPlanoContaGerencial !== undefined) entity.idPlanoContaGerencial = dto.idPlanoContaGerencial;
    if ('idCentroCusto' in dto && dto.idCentroCusto !== undefined) entity.idCentroCusto = dto.idCentroCusto;
    if ('idFazenda' in dto && dto.idFazenda !== undefined) entity.idFazenda = dto.idFazenda;
    if ('idSafra' in dto && dto.idSafra !== undefined) entity.idSafra = dto.idSafra;
    if ('idTalhao' in dto && dto.idTalhao !== undefined) entity.idTalhao = dto.idTalhao;
    if ('idMoeda' in dto && dto.idMoeda !== undefined) entity.idMoeda = dto.idMoeda;

    return entity;
  }

  /**
   * Converte uma data para string no formato YYYY-MM-DD
   *
   * @param date - Data (Date, string ou null)
   * @returns String no formato YYYY-MM-DD ou string vazia
   */
  private formatDate(date: Date | string | null | undefined): string {
    if (!date) return '';
    if (typeof date === 'string') {
      return date.split('T')[0];
    }
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return '';
  }

  /**
   * Converte entidade do domínio para DTO
   *
   * @param entity - Entidade do domínio
   * @returns DTO de resposta
   */
  toDto(entity: RecorrenciaFinanceira): RecorrenciaFinanceiraResponseDto {
    const dto: RecorrenciaFinanceiraResponseDto = {
      id: entity.id,
      tenantId: entity.tenantId,
      usuarioId: entity.usuarioId,
      tipo: entity.tipo,
      descricao: entity.descricao,
      valor: entity.valor,
      periodicidade: entity.periodicidade,
      diaVencimento: entity.diaVencimento,
      dataInicio: this.formatDate(entity.dataInicio as any),
      dataFim: entity.dataFim ? this.formatDate(entity.dataFim as any) : null,
      ativa: entity.ativa,
      idFornecedorCliente: entity.idFornecedorCliente,
      idPortador: entity.idPortador,
      idProdutor: entity.idProdutor,
      idContaDebCred: entity.idContaDebCred,
      idPlanoContaGerencial: entity.idPlanoContaGerencial,
      idCentroCusto: entity.idCentroCusto,
      idFazenda: entity.idFazenda,
      idSafra: entity.idSafra,
      idTalhao: entity.idTalhao,
      idMoeda: entity.idMoeda,
      antecedenciaGeracaoDias: entity.antecedenciaGeracaoDias,
      numeroMaximoGeracoes: entity.numeroMaximoGeracoes,
      geracoesRealizadas: entity.geracoesRealizadas,
      observacao: entity.observacao,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Mapear relacionamentos quando disponíveis
    if (entity.usuario) {
      dto.usuario = {
        id: entity.usuario.id,
        nome: entity.usuario.nome,
        email: entity.usuario.email,
      };
    }

    if ((entity as any).usuarioCriador) {
      dto.usuarioCriador = {
        id: (entity as any).usuarioCriador.id,
        nome: (entity as any).usuarioCriador.nome,
        email: (entity as any).usuarioCriador.email,
      };
    }

    if (entity.fornecedorCliente) {
      dto.fornecedorCliente = {
        id_pessoa: entity.fornecedorCliente.id_pessoa,
        nomerazao_pessoa: entity.fornecedorCliente.nomerazao_pessoa,
        cpfcnpj_pessoa: entity.fornecedorCliente.cpfcnpj_pessoa,
      };
    }

    if (entity.portador) {
      dto.portador = {
        id_pessoa: entity.portador.id_pessoa,
        nomerazao_pessoa: entity.portador.nomerazao_pessoa,
        cpfcnpj_pessoa: entity.portador.cpfcnpj_pessoa,
      };
    }

    if (entity.produtor) {
      dto.produtor = {
        id_pessoa: entity.produtor.id_pessoa,
        nomerazao_pessoa: entity.produtor.nomerazao_pessoa,
        cpfcnpj_pessoa: entity.produtor.cpfcnpj_pessoa,
      };
    }

    if (entity.conta) {
      dto.conta = {
        id: entity.conta.id,
        descricao: entity.conta.nome,
      };
    }

    if (entity.planoContaGerencial) {
      dto.planoContaGerencial = {
        id: entity.planoContaGerencial.id,
        descricao: (entity.planoContaGerencial as any).descricao || (entity.planoContaGerencial as any).nome,
      };
    }

    if (entity.centroCusto) {
      dto.centroCusto = {
        id: entity.centroCusto.id,
        descricao: entity.centroCusto.nome,
      };
    }

    if (entity.fazenda) {
      dto.fazenda = {
        id: entity.fazenda.id,
        descricao: entity.fazenda.descricao,
        idMunicipio: entity.fazenda.idMunicipio,
      };
    }

    if (entity.safra) {
      dto.safra = {
        id: entity.safra.id,
        nome: entity.safra.nome,
        dataInicio: this.formatDate(entity.safra.dataInicio as any),
        dataFim: this.formatDate(entity.safra.dataFim as any) || null,
        status: entity.safra.status,
      };
    }

    if (entity.talhao) {
      dto.talhao = {
        id_talhao: entity.talhao.id_talhao,
        descricao_talhao: entity.talhao.descricao,
      };
    }

    if (entity.moeda) {
      dto.moeda = {
        id_moeda: entity.moeda.id_moeda,
        descricao_moeda: entity.moeda.descricao_moeda,
        sigla_moeda: entity.moeda.siglabc_moeda || '',
      };
    }

    adicionarCamposFormatados(dto, ['valor']);

    return dto;
  }
}
