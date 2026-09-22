/**
 * UpdateFinanceiroDto - DTO para atualização de registro financeiro
 * 
 * DTO usado no endpoint de atualização de registro financeiro.
 * Todos os campos são opcionais, permitindo atualizações parciais.
 * 
 * @example
 * ```typescript
 * // PUT /api/financeiros/:id
 * {
 *   "valor": 2000.00,
 *   "dataVencimento": "2025-01-30"
 * }
 * ```
 */

import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsInt,
  Min,
  ValidateIf,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsDateAfter } from '../../validators/IsDateAfter';

export class UpdateFinanceiroDto extends UpdateDto {
  /**
   * ID da conta (opcional)
   */
  @IsInt({ message: 'Conta ID deve ser um número inteiro' })
  @IsOptional()
  @Min(1, { message: 'Conta ID deve ser maior que zero' })
  contaId?: number;

  /**
   * ID do histórico (opcional)
   */
  @IsInt({ message: 'Histórico ID deve ser um número inteiro' })
  @IsOptional()
  @Min(1, { message: 'Histórico ID deve ser maior que zero' })
  historicoId?: number;

  /**
   * ID do plano financeiro (opcional)
   */
  @IsInt({ message: 'Plano Financeiro ID deve ser um número inteiro' })
  @IsOptional()
  @Min(1, { message: 'Plano Financeiro ID deve ser maior que zero' })
  planoFinanceiroId?: number;

  /**
   * ID do tipo de documento (opcional)
   */
  @IsInt({ message: 'Tipo Documento ID deve ser um número inteiro' })
  @IsOptional()
  @Min(1, { message: 'Tipo Documento ID deve ser maior que zero' })
  tipoDocuentoId?: number;

  /**
   * ID do tipo de pagamento (opcional)
   */
  @IsInt({ message: 'Tipo Pagamento ID deve ser um número inteiro' })
  @IsOptional()
  @Min(1, { message: 'Tipo Pagamento ID deve ser maior que zero' })
  tipoPagamentoId?: number;

  /**
   * Descrição da conta (opcional)
   */
  @IsString({ message: 'Conta Desc deve ser uma string' })
  @IsOptional()
  contaDesc?: string;

  /**
   * Descrição do histórico (opcional)
   */
  @IsString({ message: 'Histórico Desc deve ser uma string' })
  @IsOptional()
  historicoDesc?: string;

  /**
   * Descrição do plano financeiro (opcional)
   */
  @IsString({ message: 'Plano Financeiro Desc deve ser uma string' })
  @IsOptional()
  planoFinanceiroDesc?: string;

  /**
   * Descrição do tipo de documento (opcional)
   */
  @IsString({ message: 'Tipo Documento Desc deve ser uma string' })
  @IsOptional()
  tipoDocuentoDesc?: string;

  /**
   * Descrição do tipo de pagamento (opcional)
   */
  @IsString({ message: 'Tipo Pagamento Desc deve ser uma string' })
  @IsOptional()
  tipoPagamentoDesc?: string;

  /**
   * Data de emissão do documento (formato: YYYY-MM-DD)
   */
  @IsDateString({}, { message: 'Data de emissão deve ser uma data válida no formato YYYY-MM-DD' })
  @IsOptional()
  dataEmissao?: string;

  /**
   * Data de vencimento (formato: YYYY-MM-DD)
   * Se fornecido junto com dataEmissao, deve ser posterior ou igual à data de emissão
   */
  @IsDateString({}, { message: 'Data de vencimento deve ser uma data válida no formato YYYY-MM-DD' })
  @IsOptional()
  @ValidateIf((o) => o.dataVencimento !== undefined && o.dataEmissao !== undefined)
  @Validate(IsDateAfter, ['dataEmissao'])
  dataVencimento?: string;

  /**
   * Valor da transação financeira
   * Pode ser positivo (receita) ou negativo (despesa)
   */
  @IsNumber({}, { message: 'Valor deve ser um número' })
  @IsOptional()
  valor?: number;

  /**
   * Observações sobre a transação (opcional)
   */
  @IsString({ message: 'Observação deve ser uma string' })
  @IsOptional()
  observacao?: string;
}
