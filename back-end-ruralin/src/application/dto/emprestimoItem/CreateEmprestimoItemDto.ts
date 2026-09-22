import {
  IsInt,
  IsNumber,
  IsNotEmpty,
  Min,
  Validate,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * CreateEmprestimoItemDto - DTO para criação de item de empréstimo
 *
 * DTO usado no endpoint de criação de item de empréstimo com todas as validações necessárias.
 * O campo total_empi é calculado automaticamente pelo serviço (quantidade_empi × unitario_empi).
 *
 * @example
 * ```typescript
 * // POST /api/emprestimoItens
 * {
 *   "emprestimoId": 1,
 *   "produtoId": 5,
 *   "quantidade_empi": 10.5,
 *   "unitario_empi": 25.00
 * }
 * ```
 */
export class CreateEmprestimoItemDto extends CreateDto {
  /**
   * ID do empréstimo ao qual o item pertence
   */
  @IsInt({ message: 'Empréstimo ID deve ser um número inteiro' })
  @Min(1, { message: 'Empréstimo ID deve ser maior que zero' })
  @IsNotEmpty({ message: 'Empréstimo ID é obrigatório' })
  @Validate(IsExists, ['Emprestimo', 'id'])
  emprestimoId!: number;

  /**
   * ID do produto emprestado
   */
  @IsInt({ message: 'Produto ID deve ser um número inteiro' })
  @Min(1, { message: 'Produto ID deve ser maior que zero' })
  @IsNotEmpty({ message: 'Produto ID é obrigatório' })
  @Validate(IsExists, ['Produto', 'id_prod'])
  produtoId!: number;

  /**
   * Quantidade do produto emprestado
   */
  @IsNumber({}, { message: 'Quantidade deve ser um número' })
  @Min(0.001, { message: 'Quantidade deve ser maior que zero' })
  @IsNotEmpty({ message: 'Quantidade é obrigatória' })
  quantidade_empi!: number;

  /**
   * Valor unitário do produto emprestado
   */
  @IsNumber({}, { message: 'Valor unitário deve ser um número' })
  @Min(0, { message: 'Valor unitário deve ser maior ou igual a zero' })
  @IsNotEmpty({ message: 'Valor unitário é obrigatório' })
  unitario_empi!: number;
}
