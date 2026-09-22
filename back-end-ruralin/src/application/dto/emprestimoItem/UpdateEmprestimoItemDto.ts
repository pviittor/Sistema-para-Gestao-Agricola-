import {
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  ValidateIf,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdateEmprestimoItemDto - DTO para atualização de item de empréstimo
 *
 * DTO usado no endpoint de atualização de item de empréstimo.
 * Todos os campos são opcionais, permitindo atualizações parciais.
 * O campo total_empi é recalculado automaticamente pelo serviço.
 *
 * @example
 * ```typescript
 * // PUT /api/emprestimoItens/:id
 * {
 *   "quantidade_empi": 15.0,
 *   "unitario_empi": 30.00
 * }
 * ```
 */
export class UpdateEmprestimoItemDto extends UpdateDto {
  /**
   * ID do empréstimo ao qual o item pertence
   */
  @IsInt({ message: 'Empréstimo ID deve ser um número inteiro' })
  @Min(1, { message: 'Empréstimo ID deve ser maior que zero' })
  @IsOptional()
  @ValidateIf((o) => o.emprestimoId !== undefined)
  @Validate(IsExists, ['Emprestimo', 'id'])
  emprestimoId?: number;

  /**
   * ID do produto emprestado
   */
  @IsInt({ message: 'Produto ID deve ser um número inteiro' })
  @Min(1, { message: 'Produto ID deve ser maior que zero' })
  @IsOptional()
  @ValidateIf((o) => o.produtoId !== undefined)
  @Validate(IsExists, ['Produto', 'id_prod'])
  produtoId?: number;

  /**
   * Quantidade do produto emprestado
   */
  @IsNumber({}, { message: 'Quantidade deve ser um número' })
  @Min(0.001, { message: 'Quantidade deve ser maior que zero' })
  @IsOptional()
  quantidade_empi?: number;

  /**
   * Valor unitário do produto emprestado
   */
  @IsNumber({}, { message: 'Valor unitário deve ser um número' })
  @Min(0, { message: 'Valor unitário deve ser maior ou igual a zero' })
  @IsOptional()
  unitario_empi?: number;
}
