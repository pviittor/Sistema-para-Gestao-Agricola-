import {
  IsOptional,
  IsInt,
  IsString,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
  Min,
  MaxLength,
  Matches,
  Validate,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';
import { IsValidEnum } from '../../validators/IsValidEnum';
import { FormaPagamento } from '../../../models/enums/PedidoCompraEnums';

/**
 * CreatePedidoCompraDto - DTO para criacao de pedido de compra
 */
export class CreatePedidoCompraDto extends CreateDto {
  /**
   * ID da empresa compradora
   */
  @IsInt({ message: 'ID da empresa deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID da empresa e obrigatorio' })
  @Min(1, { message: 'ID da empresa deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Empresa nao encontrada' })
  empresaId!: number;

  /**
   * ID do fornecedor
   */
  @IsInt({ message: 'ID do fornecedor deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID do fornecedor e obrigatorio' })
  @Min(1, { message: 'ID do fornecedor deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Fornecedor nao encontrado' })
  fornecedorId!: number;

  /**
   * ID do usuario comprador responsavel
   */
  @IsOptional()
  @IsInt({ message: 'ID do comprador deve ser um numero inteiro' })
  @Min(1, { message: 'ID do comprador deve ser maior que zero' })
  @Validate(IsExists, ['Usuario', 'id'], { message: 'Comprador nao encontrado' })
  compradorId?: number;

  /**
   * Data de emissao do pedido
   */
  @IsDateString({}, { message: 'Data de emissao deve ser uma data valida' })
  @IsNotEmpty({ message: 'Data de emissao e obrigatoria' })
  data_emissao!: string;

  /**
   * Data prevista para entrega
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data de previsao de entrega deve ser uma data valida' })
  data_previsao_entrega?: string;

  /**
   * ID da condicao de pagamento
   */
  @IsOptional()
  @IsInt({ message: 'ID da condicao de pagamento deve ser um numero inteiro' })
  // TODO: Adicionar @IsExists quando CondicaoPagamento for implementado
  condicaoPagamentoId?: number;

  /**
   * Forma de pagamento
   */
  @IsOptional()
  @IsString({ message: 'Forma de pagamento deve ser uma string' })
  @Validate(IsValidEnum, [FormaPagamento], { message: 'Forma de pagamento invalida' })
  forma_pagamento?: string;

  /**
   * Prazo de pagamento em dias
   */
  @IsOptional()
  @IsInt({ message: 'Prazo de pagamento deve ser um numero inteiro' })
  @Min(0, { message: 'Prazo de pagamento deve ser maior ou igual a zero' })
  prazo_pagamento_dias?: number;

  /**
   * ID do local de entrega
   */
  @IsOptional()
  @IsInt({ message: 'ID do local de entrega deve ser um numero inteiro' })
  // TODO: Adicionar @IsExists quando Deposito for implementado
  localEntregaId?: number;

  /**
   * Codigo Fiscal de Operacoes e Prestacoes
   */
  @IsOptional()
  @IsString({ message: 'CFOP deve ser uma string' })
  @Matches(/^\d{4}$/, { message: 'CFOP deve conter exatamente 4 digitos' })
  cfop?: string;

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
   * Percentual de tolerancia na entrega
   */
  @IsOptional()
  @IsNumber({}, { message: 'Percentual de tolerancia deve ser um numero' })
  @Min(0, { message: 'Percentual de tolerancia deve ser maior ou igual a zero' })
  percentual_tolerancia?: number;

  /**
   * Indica se permite entrega parcial
   */
  @IsOptional()
  @IsBoolean({ message: 'Permite entrega parcial deve ser um booleano' })
  permite_entrega_parcial?: boolean;

  /**
   * Observacoes internas do pedido
   */
  @IsOptional()
  @IsString({ message: 'Observacoes deve ser uma string' })
  observacoes?: string;

  /**
   * Observacoes para o fornecedor
   */
  @IsOptional()
  @IsString({ message: 'Observacoes do fornecedor deve ser uma string' })
  observacoes_fornecedor?: string;

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
