/**
 * UpdateEmprestimoDto - DTO para atualização de empréstimo
 *
 * DTO usado no endpoint de atualização de empréstimo.
 * Todos os campos são opcionais, permitindo atualizações parciais.
 *
 * @example
 * ```typescript
 * // PUT /api/emprestimos/:id
 * {
 *   "devolucao_emp": "2026-03-20",
 *   "observacao_emp": "Prazo de devolução prorrogado"
 * }
 * ```
 */

import {
  IsInt,
  IsOptional,
  IsDateString,
  IsString,
  IsNumber,
  Min,
  Max,
  ValidateIf,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

export class UpdateEmprestimoDto extends UpdateDto {
  /**
   * ID da fazenda vinculada ao empréstimo
   * Deve existir no banco de dados
   */
  @IsInt({ message: 'Fazenda ID deve ser um número inteiro' })
  @Min(1, { message: 'Fazenda ID deve ser maior que zero' })
  @IsOptional()
  @ValidateIf((o) => o.fazendaId !== undefined)
  @Validate(IsExists, ['Fazenda', 'id'])
  fazendaId?: number;

  /**
   * ID do parceiro (pessoa) vinculado ao empréstimo
   * Deve existir no banco de dados
   */
  @IsInt({ message: 'Parceiro ID deve ser um número inteiro' })
  @Min(1, { message: 'Parceiro ID deve ser maior que zero' })
  @IsOptional()
  @ValidateIf((o) => o.parceiroId !== undefined)
  @Validate(IsExists, ['Pessoa', 'id_pessoa'])
  parceiroId?: number;

  /**
   * Data do empréstimo (formato: YYYY-MM-DD)
   */
  @IsDateString({}, { message: 'Data do empréstimo deve ser uma data válida no formato YYYY-MM-DD' })
  @IsOptional()
  data_emp?: string;

  /**
   * Data prevista de devolução (formato: YYYY-MM-DD)
   */
  @IsDateString({}, { message: 'Data prevista de devolução deve ser uma data válida no formato YYYY-MM-DD' })
  @IsOptional()
  devolucao_emp?: string;

  /**
   * Data de encerramento efetivo do empréstimo (formato: YYYY-MM-DD)
   */
  @IsDateString({}, { message: 'Data de encerramento deve ser uma data válida no formato YYYY-MM-DD' })
  @IsOptional()
  encerramento_emp?: string;

  /**
   * Tipo do empréstimo: 0=Produto, 1=Máquina
   */
  @IsInt({ message: 'Tipo do empréstimo deve ser um número inteiro' })
  @Min(0, { message: 'Tipo do empréstimo deve ser 0 (Produto) ou 1 (Máquina)' })
  @Max(1, { message: 'Tipo do empréstimo deve ser 0 (Produto) ou 1 (Máquina)' })
  @IsOptional()
  tipo_emp?: number;

  /**
   * Situação do empréstimo: 0=Em aberto, 1=Parcialmente devolvido, 2=Concluído
   */
  @IsInt({ message: 'Situação do empréstimo deve ser um número inteiro' })
  @Min(0, { message: 'Situação deve ser 0, 1 ou 2' })
  @Max(2, { message: 'Situação deve ser 0, 1 ou 2' })
  @IsOptional()
  situacao_emp?: number;

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
