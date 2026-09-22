import {
  IsOptional,
  IsInt,
  IsString,
  IsNumber,
  IsDateString,
  Min,
  Max,
  MaxLength,
  Matches,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdateItemNotaFiscalDto - DTO para atualizacao de item de nota fiscal
 *
 * Todos os campos sao opcionais, permitindo atualizacoes parciais.
 */
export class UpdateItemNotaFiscalDto extends UpdateDto {
  /**
   * ID do produto
   */
  @IsOptional()
  @IsInt({ message: 'ID do produto deve ser um numero inteiro' })
  @Min(1, { message: 'ID do produto deve ser maior que zero' })
  @Validate(IsExists, ['Produto', 'id_prod'], { message: 'Produto nao encontrado' })
  produtoId?: number;

  /**
   * Numero sequencial do item dentro da nota
   */
  @IsOptional()
  @IsInt({ message: 'Numero do item deve ser um numero inteiro' })
  @Min(1, { message: 'Numero do item deve ser no minimo 1' })
  @Max(990, { message: 'Numero do item deve ser no maximo 990' })
  numero_item?: number;

  /**
   * Codigo do produto no momento da emissao
   */
  @IsOptional()
  @IsString({ message: 'Codigo do produto deve ser uma string' })
  @MaxLength(60, { message: 'Codigo do produto deve ter no maximo 60 caracteres' })
  codigo_produto?: string;

  /**
   * Descricao do produto no momento da emissao
   */
  @IsOptional()
  @IsString({ message: 'Descricao deve ser uma string' })
  @MaxLength(120, { message: 'Descricao deve ter no maximo 120 caracteres' })
  descricao?: string;

  /**
   * NCM - Nomenclatura Comum do Mercosul (8 digitos)
   */
  @IsOptional()
  @IsString({ message: 'NCM deve ser uma string' })
  @Matches(/^\d{8}$/, { message: 'NCM deve conter exatamente 8 digitos numericos' })
  ncm?: string;

  /**
   * CEST - Codigo Especificador da Substituicao Tributaria (7 digitos)
   */
  @IsOptional()
  @IsString({ message: 'CEST deve ser uma string' })
  @Matches(/^\d{7}$/, { message: 'CEST deve conter exatamente 7 digitos numericos' })
  cest?: string;

  /**
   * CFOP - Codigo Fiscal de Operacoes e Prestacoes (4 digitos)
   */
  @IsOptional()
  @IsString({ message: 'CFOP deve ser uma string' })
  @Matches(/^\d{4}$/, { message: 'CFOP deve conter exatamente 4 digitos numericos' })
  cfop?: string;

  /**
   * Unidade de medida
   */
  @IsOptional()
  @IsString({ message: 'Unidade deve ser uma string' })
  @MaxLength(6, { message: 'Unidade deve ter no maximo 6 caracteres' })
  unidade?: string;

  /**
   * Quantidade do item
   */
  @IsOptional()
  @IsNumber({}, { message: 'Quantidade deve ser um numero' })
  @Min(0.0001, { message: 'Quantidade deve ser no minimo 0.0001' })
  quantidade?: number;

  /**
   * Valor unitario do item
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor unitario deve ser um numero' })
  @Min(0, { message: 'Valor unitario deve ser maior ou igual a zero' })
  vl_unitario?: number;

  /**
   * Valor do desconto
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor do desconto deve ser um numero' })
  @Min(0, { message: 'Valor do desconto deve ser maior ou igual a zero' })
  vl_desconto?: number;

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
   * Outros valores
   */
  @IsOptional()
  @IsNumber({}, { message: 'Outros valores deve ser um numero' })
  @Min(0, { message: 'Outros valores deve ser maior ou igual a zero' })
  vl_outros?: number;

  /**
   * CST/CSOSN do ICMS
   */
  @IsOptional()
  @IsString({ message: 'CST ICMS deve ser uma string' })
  @MaxLength(3, { message: 'CST ICMS deve ter no maximo 3 caracteres' })
  cst_icms?: string;

  /**
   * Modalidade base de calculo ICMS
   */
  @IsOptional()
  @IsString({ message: 'Modalidade BC ICMS deve ser uma string' })
  @Matches(/^[0-3]$/, { message: 'Modalidade BC ICMS deve ser 0, 1, 2 ou 3' })
  modalidade_bc_icms?: string;

  /**
   * Aliquota ICMS (%)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Aliquota ICMS deve ser um numero' })
  @Min(0, { message: 'Aliquota ICMS deve ser no minimo 0' })
  @Max(100, { message: 'Aliquota ICMS deve ser no maximo 100' })
  aliq_icms?: number;

  /**
   * Base de calculo ICMS
   */
  @IsOptional()
  @IsNumber({}, { message: 'Base de calculo ICMS deve ser um numero' })
  @Min(0, { message: 'Base de calculo ICMS deve ser maior ou igual a zero' })
  vl_bc_icms?: number;

  /**
   * Valor do ICMS
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor do ICMS deve ser um numero' })
  @Min(0, { message: 'Valor do ICMS deve ser maior ou igual a zero' })
  vl_icms?: number;

  /**
   * Aliquota ICMS ST (%)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Aliquota ICMS ST deve ser um numero' })
  @Min(0, { message: 'Aliquota ICMS ST deve ser no minimo 0' })
  @Max(100, { message: 'Aliquota ICMS ST deve ser no maximo 100' })
  aliq_icms_st?: number;

  /**
   * Base de calculo ICMS ST
   */
  @IsOptional()
  @IsNumber({}, { message: 'Base de calculo ICMS ST deve ser um numero' })
  @Min(0, { message: 'Base de calculo ICMS ST deve ser maior ou igual a zero' })
  vl_bc_icms_st?: number;

  /**
   * Valor do ICMS ST
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor do ICMS ST deve ser um numero' })
  @Min(0, { message: 'Valor do ICMS ST deve ser maior ou igual a zero' })
  vl_icms_st?: number;

  /**
   * CST do IPI
   */
  @IsOptional()
  @IsString({ message: 'CST IPI deve ser uma string' })
  @Matches(/^\d{2}$/, { message: 'CST IPI deve conter exatamente 2 digitos' })
  cst_ipi?: string;

  /**
   * Aliquota IPI (%)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Aliquota IPI deve ser um numero' })
  @Min(0, { message: 'Aliquota IPI deve ser no minimo 0' })
  @Max(100, { message: 'Aliquota IPI deve ser no maximo 100' })
  aliq_ipi?: number;

  /**
   * Valor do IPI
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor do IPI deve ser um numero' })
  @Min(0, { message: 'Valor do IPI deve ser maior ou igual a zero' })
  vl_ipi?: number;

  /**
   * CST do PIS
   */
  @IsOptional()
  @IsString({ message: 'CST PIS deve ser uma string' })
  @Matches(/^\d{2}$/, { message: 'CST PIS deve conter exatamente 2 digitos' })
  cst_pis?: string;

  /**
   * Aliquota PIS (%)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Aliquota PIS deve ser um numero' })
  @Min(0, { message: 'Aliquota PIS deve ser no minimo 0' })
  @Max(100, { message: 'Aliquota PIS deve ser no maximo 100' })
  aliq_pis?: number;

  /**
   * Valor do PIS
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor do PIS deve ser um numero' })
  @Min(0, { message: 'Valor do PIS deve ser maior ou igual a zero' })
  vl_pis?: number;

  /**
   * CST do COFINS
   */
  @IsOptional()
  @IsString({ message: 'CST COFINS deve ser uma string' })
  @Matches(/^\d{2}$/, { message: 'CST COFINS deve conter exatamente 2 digitos' })
  cst_cofins?: string;

  /**
   * Aliquota COFINS (%)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Aliquota COFINS deve ser um numero' })
  @Min(0, { message: 'Aliquota COFINS deve ser no minimo 0' })
  @Max(100, { message: 'Aliquota COFINS deve ser no maximo 100' })
  aliq_cofins?: number;

  /**
   * Valor do COFINS
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor do COFINS deve ser um numero' })
  @Min(0, { message: 'Valor do COFINS deve ser maior ou igual a zero' })
  vl_cofins?: number;

  /**
   * Numero do lote
   */
  @IsOptional()
  @IsString({ message: 'Numero do lote deve ser uma string' })
  @MaxLength(100, { message: 'Numero do lote deve ter no maximo 100 caracteres' })
  numero_lote?: string;

  /**
   * Data de fabricacao
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data de fabricacao deve ser uma data valida no formato YYYY-MM-DD' })
  data_fabricacao?: string;

  /**
   * Data de validade
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data de validade deve ser uma data valida no formato YYYY-MM-DD' })
  data_validade?: string;

  /**
   * Numero de serie do item
   */
  @IsOptional()
  @IsString({ message: 'Numero de serie deve ser uma string' })
  @MaxLength(100, { message: 'Numero de serie deve ter no maximo 100 caracteres' })
  numero_serie_item?: string;

  /**
   * Informacoes adicionais do item
   */
  @IsOptional()
  @IsString({ message: 'Informacoes adicionais deve ser uma string' })
  informacoes_adicionais?: string;

  /**
   * ID do item do pedido de compra vinculado
   */
  @IsOptional()
  @IsInt({ message: 'ID do item do pedido de compra deve ser um numero inteiro' })
  @Min(1, { message: 'ID do item do pedido de compra deve ser maior que zero' })
  itemPedidoCompraId?: number;
}
