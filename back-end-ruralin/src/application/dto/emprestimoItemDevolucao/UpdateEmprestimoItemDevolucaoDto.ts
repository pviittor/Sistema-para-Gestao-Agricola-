import {
  IsInt,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsOptional,
  Min,
  ValidateIf,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdateEmprestimoItemDevolucaoDto - DTO para atualização de devolução de item de empréstimo
 *
 * DTO usado no endpoint de atualização de devolução de item de empréstimo.
 * Todos os campos são opcionais, permitindo atualizações parciais.
 *
 * @example
 * ```typescript
 * // PUT /api/emprestimoItemDevolucoes/:id
 * {
 *   "quantidadedevolvida_empdev": 8.0,
 *   "datadevolucao_empdev": "2026-03-01"
 * }
 * ```
 */
export class UpdateEmprestimoItemDevolucaoDto extends UpdateDto {
  /**
   * ID do item do empréstimo que está sendo devolvido
   */
  @IsInt({ message: 'Item do empréstimo ID deve ser um número inteiro' })
  @Min(1, { message: 'Item do empréstimo ID deve ser maior que zero' })
  @IsOptional()
  @ValidateIf((o) => o.itemDevolucaoId !== undefined)
  @Validate(IsExists, ['EmprestimoItem', 'id'])
  itemDevolucaoId?: number;

  /**
   * ID do produto que está sendo devolvido
   */
  @IsInt({ message: 'Produto de devolução ID deve ser um número inteiro' })
  @Min(1, { message: 'Produto de devolução ID deve ser maior que zero' })
  @IsOptional()
  @ValidateIf((o) => o.produtoDevolucaoId !== undefined)
  @Validate(IsExists, ['Produto', 'id_prod'])
  produtoDevolucaoId?: number;

  /**
   * ID do produto similar devolvido
   */
  @IsInt({ message: 'Produto similar ID deve ser um número inteiro' })
  @Min(1, { message: 'Produto similar ID deve ser maior que zero' })
  @IsOptional()
  @ValidateIf((o) => o.produtoSimilarId !== undefined && o.produtoSimilarId !== null)
  @Validate(IsExists, ['Produto', 'id_prod'])
  produtoSimilarId?: number;

  /**
   * Data da devolução (formato: YYYY-MM-DD)
   */
  @IsDateString({}, { message: 'Data de devolução deve ser uma data válida no formato YYYY-MM-DD' })
  @IsOptional()
  datadevolucao_empdev?: string;

  /**
   * Quantidade devolvida nesta operação
   */
  @IsNumber({}, { message: 'Quantidade devolvida deve ser um número' })
  @Min(0.001, { message: 'Quantidade devolvida deve ser maior que zero' })
  @IsOptional()
  quantidadedevolvida_empdev?: number;

  /**
   * Indica se a devolução gera um lançamento financeiro
   */
  @IsBoolean({ message: 'O campo devolucaoGeraFinanceiro_empdev deve ser um booleano' })
  @IsOptional()
  devolucaoGeraFinanceiro_empdev?: boolean;

  /**
   * Indica se a devolução é de produto similar ao emprestado
   */
  @IsBoolean({ message: 'O campo devolucaoProdutoSimilar_empdev deve ser um booleano' })
  @IsOptional()
  devolucaoProdutoSimilar_empdev?: boolean;
}
