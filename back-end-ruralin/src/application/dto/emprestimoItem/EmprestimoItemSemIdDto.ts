import {
  IsInt,
  IsNumber,
  IsNotEmpty,
  Min,
  Validate,
} from 'class-validator';
import { IsExists } from '../../validators/IsExists';

/**
 * EmprestimoItemSemIdDto - DTO para item de empréstimo sem ID do pai
 *
 * Usado na criação e atualização atômica (master-detail) de empréstimos.
 * Não contém `emprestimoId` (FK do pai) pois o serviço injeta esse campo
 * após a criação do empréstimo pai.
 *
 * @example
 * ```typescript
 * // Dentro de CreateEmprestimoCompletoDto
 * {
 *   "produtoId": 5,
 *   "quantidade_empi": 10.5,
 *   "unitario_empi": 25.00
 * }
 * ```
 */
export class EmprestimoItemSemIdDto {
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
