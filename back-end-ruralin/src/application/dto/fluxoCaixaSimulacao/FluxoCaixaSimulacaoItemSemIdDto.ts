/**
 * FluxoCaixaSimulacaoItemSemIdDto - DTO para item de simulação sem ID do pai
 *
 * Usado na criação e atualização atômica (master-detail) de simulações.
 * Não contém `simulacaoId` (FK do pai) pois o serviço injeta esse campo
 * após a criação da simulação pai.
 *
 * @example
 * ```typescript
 * // Dentro de CreateFluxoCaixaSimulacaoCompletoDto
 * {
 *   "tipoOverride": "antecipar_recebimento",
 *   "referenciaTipo": "parcela_titulo_receber",
 *   "referenciaId": 42,
 *   "descricao": "Antecipar recebimento da safra",
 *   "tipoFluxo": "entrada",
 *   "dataOriginal": "2026-12-15",
 *   "dataNova": "2026-09-15",
 *   "valorOriginal": 50000,
 *   "valorNovo": 48000,
 *   "contaBancariaId": 1
 * }
 * ```
 */

import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsNumber,
  IsDateString,
  IsIn,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';

export class FluxoCaixaSimulacaoItemSemIdDto {
  /**
   * Tipo de override aplicado na simulação
   */
  @IsString({ message: 'Tipo override deve ser uma string' })
  @IsNotEmpty({ message: 'Tipo override é obrigatório' })
  @IsIn(
    [
      'adiar_pagamento',
      'antecipar_recebimento',
      'adicionar_entrada',
      'adicionar_saida',
      'remover_lancamento',
      'alterar_valor',
    ],
    {
      message:
        'Tipo override deve ser: adiar_pagamento, antecipar_recebimento, adicionar_entrada, adicionar_saida, remover_lancamento ou alterar_valor',
    },
  )
  tipoOverride!: string;

  /**
   * Tipo da referência original (origem do lançamento)
   */
  @IsString({ message: 'Referência tipo deve ser uma string' })
  @IsIn(
    [
      'parcela_financeira',
      'parcela_titulo_pagar',
      'parcela_titulo_receber',
      'agreement_schedule',
      'manual',
    ],
    {
      message:
        'Referência tipo deve ser: parcela_financeira, parcela_titulo_pagar, parcela_titulo_receber, agreement_schedule ou manual',
    },
  )
  @IsOptional()
  referenciaTipo?: string;

  /**
   * ID da referência original
   */
  @IsInt({ message: 'Referência ID deve ser um número inteiro' })
  @IsOptional()
  referenciaId?: number;

  /**
   * Descrição do item de simulação
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(500, { message: 'Descrição deve ter no máximo 500 caracteres' })
  descricao!: string;

  /**
   * Tipo de fluxo: entrada ou saída
   */
  @IsString({ message: 'Tipo fluxo deve ser uma string' })
  @IsNotEmpty({ message: 'Tipo fluxo é obrigatório' })
  @IsIn(['entrada', 'saida'], { message: 'Tipo fluxo deve ser: entrada ou saida' })
  tipoFluxo!: string;

  /**
   * Data original do lançamento (formato: YYYY-MM-DD)
   */
  @IsDateString({}, { message: 'Data original deve ser uma data válida no formato YYYY-MM-DD' })
  @IsOptional()
  dataOriginal?: string;

  /**
   * Nova data proposta na simulação (formato: YYYY-MM-DD)
   */
  @IsDateString({}, { message: 'Data nova deve ser uma data válida no formato YYYY-MM-DD' })
  @IsOptional()
  dataNova?: string;

  /**
   * Valor original do lançamento
   */
  @IsNumber({}, { message: 'Valor original deve ser um número' })
  @Min(0, { message: 'Valor original deve ser maior ou igual a zero' })
  @IsOptional()
  valorOriginal?: number;

  /**
   * Novo valor proposto na simulação
   */
  @IsNumber({}, { message: 'Valor novo deve ser um número' })
  @Min(0, { message: 'Valor novo deve ser maior ou igual a zero' })
  @IsOptional()
  valorNovo?: number;

  /**
   * ID da conta bancária associada ao item
   */
  @IsInt({ message: 'Conta bancária ID deve ser um número inteiro' })
  @IsOptional()
  contaBancariaId?: number;
}
