/**
 * PessoaMapper - Mapper para entidade Pessoa
 * 
 * Responsável por converter entre DTOs e entidades do domínio para Pessoa.
 * 
 * Regras importantes:
 * - Converter datas corretamente
 * - Tratar campos opcionais corretamente
 * - Mapear id_pessoa para id nos DTOs (se necessário)
 * 
 * @example
 * ```typescript
 * const mapper = new PessoaMapper();
 * 
 * // Converter DTO para entidade
 * const entity = await mapper.toEntity(createDto);
 * 
 * // Converter entidade para DTO
 * const dto = mapper.toDto(pessoa);
 * ```
 */

import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import Pessoa from '../../models/Pessoa';
import { CreatePessoaDto } from '../dto/pessoa/CreatePessoaDto';
import { UpdatePessoaDto } from '../dto/pessoa/UpdatePessoaDto';
import { PessoaResponseDto } from '../dto/pessoa/PessoaResponseDto';

/**
 * Mapper para entidade Pessoa
 * 
 * Implementa conversão entre DTOs e entidades, garantindo que:
 * - Datas sejam convertidas corretamente
 * - Campos opcionais sejam tratados corretamente
 * - Valores booleanos sejam preservados
 */
@Injectable()
export class PessoaMapper implements IMapper<Pessoa, PessoaResponseDto, CreatePessoaDto, UpdatePessoaDto> {
  /**
   * Converte DTO para entidade do domínio
   * 
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreatePessoaDto | UpdatePessoaDto): Promise<Partial<Pessoa>> {
    const entity: any = {};

    // Campos de texto
    if ('nomerazao_pessoa' in dto && dto.nomerazao_pessoa !== undefined) entity.nomerazao_pessoa = dto.nomerazao_pessoa;
    if ('nomefantasia_pessoa' in dto && dto.nomefantasia_pessoa !== undefined) entity.nomefantasia_pessoa = dto.nomefantasia_pessoa;
    if ('cpfcnpj_pessoa' in dto && dto.cpfcnpj_pessoa !== undefined) entity.cpfcnpj_pessoa = dto.cpfcnpj_pessoa;
    if ('contato_pessoa' in dto && dto.contato_pessoa !== undefined) entity.contato_pessoa = dto.contato_pessoa;
    if ('email_pessoa' in dto && dto.email_pessoa !== undefined) entity.email_pessoa = dto.email_pessoa;
    if ('identidade_pessoa' in dto && dto.identidade_pessoa !== undefined) entity.identidade_pessoa = dto.identidade_pessoa;
    if ('orgaoidentidade_pessoa' in dto && dto.orgaoidentidade_pessoa !== undefined) entity.orgaoidentidade_pessoa = dto.orgaoidentidade_pessoa;
    if ('caixapostal_pessoa' in dto && dto.caixapostal_pessoa !== undefined) entity.caixapostal_pessoa = dto.caixapostal_pessoa;
    if ('cep_pessoa' in dto && dto.cep_pessoa !== undefined) entity.cep_pessoa = dto.cep_pessoa;
    if ('complemento_pessoa' in dto && dto.complemento_pessoa !== undefined) entity.complemento_pessoa = dto.complemento_pessoa;
    if ('certidaonegativa_pessoa' in dto && dto.certidaonegativa_pessoa !== undefined) entity.certidaonegativa_pessoa = dto.certidaonegativa_pessoa;
    if ('codigoautorizacao_pessoa' in dto && dto.codigoautorizacao_pessoa !== undefined) entity.codigoautorizacao_pessoa = dto.codigoautorizacao_pessoa;
    if ('endereco_pessoa' in dto && dto.endereco_pessoa !== undefined) entity.endereco_pessoa = dto.endereco_pessoa;
    if ('bairro_pessoa' in dto && dto.bairro_pessoa !== undefined) entity.bairro_pessoa = dto.bairro_pessoa;
    if ('numero_pessoa' in dto && dto.numero_pessoa !== undefined) entity.numero_pessoa = dto.numero_pessoa;
    if ('telefone1_pessoa' in dto && dto.telefone1_pessoa !== undefined) entity.telefone1_pessoa = dto.telefone1_pessoa;
    if ('inscricaoEstadual_pessoa' in dto && dto.inscricaoEstadual_pessoa !== undefined) entity.inscricaoEstadual_pessoa = dto.inscricaoEstadual_pessoa;
    if ('observacao_pessoa' in dto && dto.observacao_pessoa !== undefined) entity.observacao_pessoa = dto.observacao_pessoa;
    if ('inscricaoMunicipal_pessoa' in dto && dto.inscricaoMunicipal_pessoa !== undefined) entity.inscricaoMunicipal_pessoa = dto.inscricaoMunicipal_pessoa;

    // Campos de data
    if ('nascimento_pessoa' in dto && dto.nascimento_pessoa !== undefined) {
      entity.nascimento_pessoa = dto.nascimento_pessoa ? new Date(dto.nascimento_pessoa) : null;
    }

    // Campos booleanos
    if ('cliente_pessoa' in dto && dto.cliente_pessoa !== undefined) entity.cliente_pessoa = dto.cliente_pessoa;
    if ('produtor_pessoa' in dto && dto.produtor_pessoa !== undefined) entity.produtor_pessoa = dto.produtor_pessoa;
    if ('portador_pessoa' in dto && dto.portador_pessoa !== undefined) entity.portador_pessoa = dto.portador_pessoa;
    if ('funcionario_pessoa' in dto && dto.funcionario_pessoa !== undefined) entity.funcionario_pessoa = dto.funcionario_pessoa;
    if ('fornecedor_pessoa' in dto && dto.fornecedor_pessoa !== undefined) entity.fornecedor_pessoa = dto.fornecedor_pessoa;
    if ('motorista_pessoa' in dto && dto.motorista_pessoa !== undefined) entity.motorista_pessoa = dto.motorista_pessoa;
    if ('operador_pessoa' in dto && dto.operador_pessoa !== undefined) entity.operador_pessoa = dto.operador_pessoa;

    // Campos numéricos
    if ('idMunicipio' in dto && dto.idMunicipio !== undefined) entity.idMunicipio = dto.idMunicipio;
    if ('tipo_pessoa' in dto && dto.tipo_pessoa !== undefined) entity.tipo_pessoa = dto.tipo_pessoa;

    return entity;
  }

  /**
   * Converte entidade do domínio para DTO
   * 
   * @param entity - Entidade do domínio
   * @returns DTO de resposta
   */
  toDto(entity: Pessoa): PessoaResponseDto {
    return {
      id_pessoa: entity.id_pessoa,
      tenantId: entity.tenantId,
      nomerazao_pessoa: entity.nomerazao_pessoa,
      nomefantasia_pessoa: entity.nomefantasia_pessoa,
      cpfcnpj_pessoa: entity.cpfcnpj_pessoa,
      nascimento_pessoa: entity.nascimento_pessoa,
      contato_pessoa: entity.contato_pessoa,
      email_pessoa: entity.email_pessoa,
      identidade_pessoa: entity.identidade_pessoa,
      orgaoidentidade_pessoa: entity.orgaoidentidade_pessoa,
      caixapostal_pessoa: entity.caixapostal_pessoa,
      cep_pessoa: entity.cep_pessoa,
      complemento_pessoa: entity.complemento_pessoa,
      certidaonegativa_pessoa: entity.certidaonegativa_pessoa,
      codigoautorizacao_pessoa: entity.codigoautorizacao_pessoa,
      cliente_pessoa: entity.cliente_pessoa,
      produtor_pessoa: entity.produtor_pessoa,
      portador_pessoa: entity.portador_pessoa,
      funcionario_pessoa: entity.funcionario_pessoa,
      fornecedor_pessoa: entity.fornecedor_pessoa,
      motorista_pessoa: entity.motorista_pessoa,
      operador_pessoa: entity.operador_pessoa,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
      idMunicipio: entity.idMunicipio,
      tipo_pessoa: entity.tipo_pessoa,
      endereco_pessoa: entity.endereco_pessoa,
      bairro_pessoa: entity.bairro_pessoa,
      numero_pessoa: entity.numero_pessoa,
      telefone1_pessoa: entity.telefone1_pessoa,
      inscricaoEstadual_pessoa: entity.inscricaoEstadual_pessoa,
      observacao_pessoa: entity.observacao_pessoa,
      inscricaoMunicipal_pessoa: entity.inscricaoMunicipal_pessoa,
    };
  }
}
