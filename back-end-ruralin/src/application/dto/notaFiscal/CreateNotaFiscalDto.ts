import {
  IsOptional,
  IsInt,
  IsString,
  IsDateString,
  IsNumber,
  IsNotEmpty,
  Min,
  MaxLength,
  MinLength,
  Matches,
  Validate,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';
import { IsValidEnum } from '../../validators/IsValidEnum';
import {
  TipoNotaFiscal,
  ModeloNotaFiscal,
  FinalidadeNotaFiscal,
  ModalidadeFrete,
} from '../../../models/enums/NotaFiscalEnums';

/**
 * CreateNotaFiscalDto - DTO para criacao de nota fiscal
 */
export class CreateNotaFiscalDto extends CreateDto {
  /**
   * Tipo da nota fiscal (entrada, saida)
   */
  @IsString({ message: 'Tipo deve ser uma string' })
  @IsNotEmpty({ message: 'Tipo e obrigatorio' })
  @Validate(IsValidEnum, [TipoNotaFiscal], { message: 'Tipo de nota fiscal invalido' })
  tipo!: string;

  /**
   * Numero da nota fiscal
   */
  @IsString({ message: 'Numero deve ser uma string' })
  @IsNotEmpty({ message: 'Numero e obrigatorio' })
  @MaxLength(20, { message: 'Numero deve ter no maximo 20 caracteres' })
  numero!: string;

  /**
   * Serie da nota fiscal
   */
  @IsString({ message: 'Serie deve ser uma string' })
  @IsNotEmpty({ message: 'Serie e obrigatoria' })
  @MaxLength(5, { message: 'Serie deve ter no maximo 5 caracteres' })
  serie!: string;

  /**
   * Chave de acesso da NF-e (44 digitos)
   */
  @IsOptional()
  @IsString({ message: 'Chave de acesso deve ser uma string' })
  @Matches(/^\d{44}$/, { message: 'Chave de acesso deve conter exatamente 44 digitos' })
  chave_acesso?: string;

  /**
   * Modelo do documento fiscal
   */
  @IsString({ message: 'Modelo deve ser uma string' })
  @IsNotEmpty({ message: 'Modelo e obrigatorio' })
  @Validate(IsValidEnum, [ModeloNotaFiscal], { message: 'Modelo de nota fiscal invalido' })
  modelo!: string;

  /**
   * Natureza da operacao
   */
  @IsString({ message: 'Natureza da operacao deve ser uma string' })
  @IsNotEmpty({ message: 'Natureza da operacao e obrigatoria' })
  @MaxLength(60, { message: 'Natureza da operacao deve ter no maximo 60 caracteres' })
  natureza_operacao!: string;

  /**
   * Codigo Fiscal de Operacoes e Prestacoes
   */
  @IsString({ message: 'CFOP deve ser uma string' })
  @IsNotEmpty({ message: 'CFOP e obrigatorio' })
  @Matches(/^\d{4}$/, { message: 'CFOP deve conter exatamente 4 digitos' })
  cfop!: string;

  /**
   * Finalidade da nota fiscal
   */
  @IsString({ message: 'Finalidade deve ser uma string' })
  @IsNotEmpty({ message: 'Finalidade e obrigatoria' })
  @Validate(IsValidEnum, [FinalidadeNotaFiscal], { message: 'Finalidade de nota fiscal invalida' })
  finalidade!: string;

  /**
   * Data de emissao da nota fiscal
   */
  @IsDateString({}, { message: 'Data de emissao deve ser uma data valida' })
  @IsNotEmpty({ message: 'Data de emissao e obrigatoria' })
  data_emissao!: string;

  /**
   * Data de entrada ou saida da mercadoria
   */
  @IsDateString({}, { message: 'Data de entrada/saida deve ser uma data valida' })
  @IsNotEmpty({ message: 'Data de entrada/saida e obrigatoria' })
  data_entrada_saida!: string;

  /**
   * Hora de entrada ou saida
   */
  @IsOptional()
  @IsString({ message: 'Hora de entrada/saida deve ser uma string' })
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, { message: 'Hora de entrada/saida deve estar no formato HH:mm ou HH:mm:ss' })
  hora_entrada_saida?: string;

  /**
   * ID da pessoa emitente
   */
  @IsInt({ message: 'ID do emitente deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID do emitente e obrigatorio' })
  @Min(1, { message: 'ID do emitente deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Emitente nao encontrado' })
  emitenteId!: number;

  /**
   * ID da pessoa destinataria
   */
  @IsInt({ message: 'ID do destinatario deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID do destinatario e obrigatorio' })
  @Min(1, { message: 'ID do destinatario deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Destinatario nao encontrado' })
  destinatarioId!: number;

  /**
   * ID da empresa
   */
  @IsInt({ message: 'ID da empresa deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID da empresa e obrigatorio' })
  @Min(1, { message: 'ID da empresa deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Empresa nao encontrada' })
  empresaId!: number;

  /**
   * ID da pessoa transportadora
   */
  @IsOptional()
  @IsInt({ message: 'ID da transportadora deve ser um numero inteiro' })
  @Min(1, { message: 'ID da transportadora deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Transportadora nao encontrada' })
  transportadoraId?: number;

  /**
   * Modalidade de frete
   */
  @IsOptional()
  @IsString({ message: 'Modalidade de frete deve ser uma string' })
  @Validate(IsValidEnum, [ModalidadeFrete], { message: 'Modalidade de frete invalida' })
  modalidade_frete?: string;

  /**
   * Valor do frete
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor do frete deve ser um numero' })
  @Min(0, { message: 'Valor do frete deve ser maior ou igual a zero' })
  vl_frete?: number;

  /**
   * Valor do seguro
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor do seguro deve ser um numero' })
  @Min(0, { message: 'Valor do seguro deve ser maior ou igual a zero' })
  vl_seguro?: number;

  /**
   * Valor do desconto
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor do desconto deve ser um numero' })
  @Min(0, { message: 'Valor do desconto deve ser maior ou igual a zero' })
  vl_desconto?: number;

  /**
   * Outras despesas acessorias
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor de outras despesas deve ser um numero' })
  @Min(0, { message: 'Valor de outras despesas deve ser maior ou igual a zero' })
  vl_outros?: number;

  /**
   * Quantidade de volumes
   */
  @IsOptional()
  @IsInt({ message: 'Quantidade de volumes deve ser um numero inteiro' })
  @Min(0, { message: 'Quantidade de volumes deve ser maior ou igual a zero' })
  volumes_qtd?: number;

  /**
   * Especie dos volumes
   */
  @IsOptional()
  @IsString({ message: 'Especie dos volumes deve ser uma string' })
  @MaxLength(60, { message: 'Especie dos volumes deve ter no maximo 60 caracteres' })
  volumes_especie?: string;

  /**
   * Peso bruto em kg
   */
  @IsOptional()
  @IsNumber({}, { message: 'Peso bruto deve ser um numero' })
  @Min(0, { message: 'Peso bruto deve ser maior ou igual a zero' })
  peso_bruto?: number;

  /**
   * Peso liquido em kg
   */
  @IsOptional()
  @IsNumber({}, { message: 'Peso liquido deve ser um numero' })
  @Min(0, { message: 'Peso liquido deve ser maior ou igual a zero' })
  peso_liquido?: number;

  /**
   * Informacoes adicionais de interesse do fisco
   */
  @IsOptional()
  @IsString({ message: 'Informacoes adicionais deve ser uma string' })
  informacoes_adicionais?: string;

  /**
   * Informacoes complementares de interesse do contribuinte
   */
  @IsOptional()
  @IsString({ message: 'Informacoes complementares deve ser uma string' })
  informacoes_complementares?: string;

  /**
   * ID da nota fiscal de referencia (para devolucoes)
   */
  @IsOptional()
  @IsInt({ message: 'ID da nota fiscal de referencia deve ser um numero inteiro' })
  @Min(1, { message: 'ID da nota fiscal de referencia deve ser maior que zero' })
  @Validate(IsExists, ['NotaFiscal', 'id_nf'], { message: 'Nota fiscal de referencia nao encontrada' })
  notaFiscalRefId?: number;

  /**
   * ID do CFOP (referencia tabela CFOP)
   */
  @IsOptional()
  @IsInt({ message: 'ID do CFOP deve ser um numero inteiro' })
  cfopId?: number;

  /**
   * ID do certificado digital
   */
  @IsOptional()
  @IsInt({ message: 'ID do certificado digital deve ser um numero inteiro' })
  certificadoDigitalId?: number;

  /**
   * Ambiente SEFAZ (homologacao ou producao)
   */
  @IsOptional()
  @IsString({ message: 'Ambiente SEFAZ deve ser uma string' })
  ambiente_sefaz?: string;

  /**
   * Condicao de pagamento
   */
  @IsOptional()
  @IsString({ message: 'Condicao de pagamento deve ser uma string' })
  @MaxLength(50, { message: 'Condicao de pagamento deve ter no maximo 50 caracteres' })
  condicao_pagamento?: string;

  /**
   * Quantidade de parcelas
   */
  @IsOptional()
  @IsInt({ message: 'Quantidade de parcelas deve ser um numero inteiro' })
  @Min(1, { message: 'Quantidade de parcelas deve ser no minimo 1' })
  parcelas_qtd?: number;
}
