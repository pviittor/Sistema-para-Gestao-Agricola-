/**
 * CreateEmprestimoDto - DTO para criação de empréstimo
 *
 * DTO usado no endpoint de criação de empréstimo com todas as validações necessárias.
 *
 * @example
 * ```typescript
 * // POST /api/emprestimos
 * {
 *   "fazendaId": 1,
 *   "parceiroId": 10,
 *   "data_emp": "2026-02-28",
 *   "devolucao_emp": "2026-03-15",
 *   "tipo_emp": 0,
 *   "observacao_emp": "Empréstimo de sementes"
 * }
 * ```
 */

import {
  IsInt,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  Validate,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';

export class CreateEmprestimoDto extends CreateDto {
  /**
   * ID da fazenda vinculada ao empréstimo
   * Deve existir no banco de dados
   */
  @IsInt({ message: 'Fazenda ID deve ser um número inteiro' })
  @Min(1, { message: 'Fazenda ID deve ser maior que zero' })
  @IsNotEmpty({ message: 'Fazenda ID é obrigatório' })
  @Validate(IsExists, ['Fazenda', 'id'])
  fazendaId!: number;

  /**
   * ID do parceiro (pessoa) vinculado ao empréstimo
   * Deve existir no banco de dados
   */
  @IsInt({ message: 'Parceiro ID deve ser um número inteiro' })
  @Min(1, { message: 'Parceiro ID deve ser maior que zero' })
  @IsNotEmpty({ message: 'Parceiro ID é obrigatório' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'])
  parceiroId!: number;

  /**
   * Data do empréstimo (formato: YYYY-MM-DD)
   */
  @IsDateString({}, { message: 'Data do empréstimo deve ser uma data válida no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data do empréstimo é obrigatória' })
  data_emp!: string;

  /**
   * Data prevista de devolução (formato: YYYY-MM-DD)
   */
  @IsDateString({}, { message: 'Data prevista de devolução deve ser uma data válida no formato YYYY-MM-DD' })
  @IsOptional()
  devolucao_emp?: string;

  /**
   * Tipo do empréstimo: 0=Produto, 1=Máquina
   */
  @IsInt({ message: 'Tipo do empréstimo deve ser um número inteiro' })
  @Min(0, { message: 'Tipo do empréstimo deve ser 0 (Produto) ou 1 (Máquina)' })
  @Max(1, { message: 'Tipo do empréstimo deve ser 0 (Produto) ou 1 (Máquina)' })
  @IsNotEmpty({ message: 'Tipo do empréstimo é obrigatório' })
  tipo_emp!: number;

  /**
   * Observações gerais sobre o empréstimo
   */
  @IsString({ message: 'Observação deve ser uma string' })
  @IsOptional()
  observacao_emp?: string;

  /**
   * Prazo em dias para devolução
   */
  @IsOptional()
  @IsInt({ message: 'Prazo em dias deve ser um número inteiro' })
  @Min(1, { message: 'Prazo em dias deve ser no mínimo 1' })
  prazo_dias?: number;

  /**
   * Percentual de multa sobre valor total (0-100)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Multa percentual deve ser um número' })
  @Min(0, { message: 'Multa percentual deve ser no mínimo 0' })
  @Max(100, { message: 'Multa percentual deve ser no máximo 100' })
  multa_percentual?: number;

  /**
   * Percentual de juros ao dia sobre valor total (0-10)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Juros diário percentual deve ser um número' })
  @Min(0, { message: 'Juros diário percentual deve ser no mínimo 0' })
  @Max(10, { message: 'Juros diário percentual deve ser no máximo 10' })
  juros_diario_percentual?: number;
}
