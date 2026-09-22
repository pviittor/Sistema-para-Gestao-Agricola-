/**
 * TituloReceberMapper - Mapper para entidade TituloReceber
 * 
 * Responsável por converter entre DTOs e entidades do domínio para TituloReceber.
 * 
 * Regras importantes:
 * - Converter datas corretamente (dataLancamento)
 * - Tratar campos opcionais corretamente
 * - Preservar valores numéricos e booleanos
 * - Mapear relacionamentos quando incluídos
 * 
 * @example
 * ```typescript
 * const mapper = new TituloReceberMapper();
 * 
 * // Converter DTO para entidade
 * const entity = await mapper.toEntity(createDto);
 * 
 * // Converter entidade para DTO
 * const dto = mapper.toDto(tituloReceber);
 * ```
 */

import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import TituloReceber, { StatusTituloReceber } from '../../models/TituloReceber';
import { CreateTituloReceberDto } from '../dto/tituloReceber/CreateTituloReceberDto';
import { UpdateTituloReceberDto } from '../dto/tituloReceber/UpdateTituloReceberDto';
import { TituloReceberResponseDto } from '../dto/tituloReceber/TituloReceberResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade TituloReceber
 * 
 * Implementa conversão entre DTOs e entidades, garantindo que:
 * - Datas sejam convertidas corretamente
 * - Campos opcionais sejam tratados corretamente
 * - Valores booleanos sejam preservados
 * - Relacionamentos sejam mapeados quando disponíveis
 */
@Injectable()
export class TituloReceberMapper implements IMapper<TituloReceber, TituloReceberResponseDto, CreateTituloReceberDto, UpdateTituloReceberDto> {
  /**
   * Converte DTO para entidade do domínio
   * 
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreateTituloReceberDto | UpdateTituloReceberDto): Promise<Partial<TituloReceber>> {
    const entity: any = {};

    // Campos de relacionamento (FKs)
    if ('idCliente' in dto && dto.idCliente !== undefined) entity.idCliente = dto.idCliente;
    if ('idPortador' in dto && dto.idPortador !== undefined) entity.idPortador = dto.idPortador;
    if ('idProdutor' in dto && dto.idProdutor !== undefined) entity.idProdutor = dto.idProdutor;
    if ('idFazenda' in dto && dto.idFazenda !== undefined) entity.idFazenda = dto.idFazenda;
    if ('idSafra' in dto && dto.idSafra !== undefined) entity.idSafra = dto.idSafra;
    if ('idMoeda' in dto && dto.idMoeda !== undefined) entity.idMoeda = dto.idMoeda;
    if ('contaBancariaId' in dto && dto.contaBancariaId !== undefined) entity.contaBancariaId = dto.contaBancariaId;

    // Campos de data
    if ('dataLancamento' in dto && dto.dataLancamento !== undefined) {
      entity.dataLancamento = dto.dataLancamento ? new Date(dto.dataLancamento) : null;
    }

    // Campos de texto
    if ('numeroTitulo' in dto && dto.numeroTitulo !== undefined) entity.numeroTitulo = dto.numeroTitulo;
    if ('observacao' in dto && dto.observacao !== undefined) entity.observacao = dto.observacao;

    // Campos numéricos
    if ('valorTitulo' in dto && dto.valorTitulo !== undefined) entity.valorTitulo = dto.valorTitulo;
    if ('valorTituloMoedaOriginal' in dto && dto.valorTituloMoedaOriginal !== undefined) {
      entity.valorTituloMoedaOriginal = dto.valorTituloMoedaOriginal;
    }
    if ('valorTituloMoedaPadrao' in dto && dto.valorTituloMoedaPadrao !== undefined) {
      entity.valorTituloMoedaPadrao = dto.valorTituloMoedaPadrao;
    }
    if ('quantidadeParcelas' in dto && dto.quantidadeParcelas !== undefined) {
      entity.quantidadeParcelas = dto.quantidadeParcelas;
    }

    // Campos booleanos
    if ('impostoRenda' in dto && dto.impostoRenda !== undefined) entity.impostoRenda = dto.impostoRenda;

    // Campos enum
    if ('status' in dto && dto.status !== undefined) entity.status = dto.status;

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
      // Se já é string, retornar apenas a parte da data (YYYY-MM-DD)
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
  toDto(entity: TituloReceber): TituloReceberResponseDto {
    const dto: TituloReceberResponseDto = {
      id: entity.id,
      tenantId: entity.tenantId,
      idCliente: entity.idCliente,
      idPortador: entity.idPortador,
      idProdutor: entity.idProdutor,
      idFazenda: entity.idFazenda,
      idSafra: entity.idSafra,
      idMoeda: entity.idMoeda,
      dataLancamento: this.formatDate(entity.dataLancamento as any),
      numeroTitulo: entity.numeroTitulo,
      valorTitulo: entity.valorTitulo,
      valorTituloMoedaOriginal: entity.valorTituloMoedaOriginal,
      valorTituloMoedaPadrao: entity.valorTituloMoedaPadrao,
      quantidadeParcelas: entity.quantidadeParcelas,
      observacao: entity.observacao,
      impostoRenda: entity.impostoRenda,
      status: entity.status,
      origemTipo: (entity as any).origemTipo || undefined,
      origemId: (entity as any).origemId || undefined,
      contaBancariaId: (entity as any).contaBancariaId || null,
      contaBancaria: (entity as any).contaBancaria || undefined,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Mapear relacionamentos quando disponíveis
    if (entity.cliente) {
      dto.cliente = {
        id_pessoa: entity.cliente.id_pessoa,
        nomerazao_pessoa: entity.cliente.nomerazao_pessoa,
        cpfcnpj_pessoa: entity.cliente.cpfcnpj_pessoa,
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

    if (entity.moeda) {
      dto.moeda = {
        id_moeda: entity.moeda.id_moeda,
        descricao_moeda: entity.moeda.descricao_moeda,
        sigla_moeda: entity.moeda.siglabc_moeda || '',
      };
    }

    if (entity.usuarioCriador) {
      dto.usuarioCriador = {
        id: entity.usuarioCriador.id,
        nome: entity.usuarioCriador.nome,
        email: entity.usuarioCriador.email,
      };
    }

    // Mapear parcelas quando disponíveis (via include)
    if ((entity as any).parcelas && Array.isArray((entity as any).parcelas)) {
      dto.parcelas = (entity as any).parcelas.map((parcela: any) => {
        const parcelaDto = {
          id: parcela.id,
          numeroParcela: parcela.numeroParcela,
          dataVencimento: this.formatDate(parcela.dataVencimento),
          valorParcela: parcela.valorParcela,
          status: parcela.status,
        };
        return adicionarCamposFormatados(parcelaDto, ['valorParcela']);
      });
    }

    // Mapear rateios de plano de contas quando disponíveis (via include)
    if ((entity as any).rateiosPlanoConta && Array.isArray((entity as any).rateiosPlanoConta)) {
      dto.rateiosPlanoConta = (entity as any).rateiosPlanoConta.map((rateio: any) => {
        const rateioDto = {
          id: rateio.id,
          idPlanoContaGerencial: rateio.idPlanoContaGerencial,
          valorRateio: rateio.valorRateio,
          percentualRateio: rateio.percentualRateio,
        };
        return adicionarCamposFormatados(rateioDto, ['valorRateio']);
      });
    }

    // Mapear rateios de centro de custo quando disponíveis (via include)
    if ((entity as any).rateiosCentroCusto && Array.isArray((entity as any).rateiosCentroCusto)) {
      dto.rateiosCentroCusto = (entity as any).rateiosCentroCusto.map((rateio: any) => {
        const rateioDto = {
          id: rateio.id,
          idCentroCusto: rateio.idCentroCusto,
          valorRateio: rateio.valorRateio,
          percentualRateio: rateio.percentualRateio,
        };
        return adicionarCamposFormatados(rateioDto, ['valorRateio']);
      });
    }

    adicionarCamposFormatados(dto, ['valorTitulo', 'valorTituloMoedaOriginal', 'valorTituloMoedaPadrao']);

    return dto;
  }
}
