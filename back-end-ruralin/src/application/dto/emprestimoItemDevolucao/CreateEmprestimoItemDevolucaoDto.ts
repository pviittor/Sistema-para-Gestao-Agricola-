import {
  IsInt,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  Min,
  ValidateIf,
  Validate,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';
import { IsRequiredIf } from '../../validators/IsRequiredIf';

/**
 * CreateEmprestimoItemDevolucaoDto - DTO para criação de devolução de item de empréstimo
 *
 * DTO usado no endpoint de criação de devolução de item de empréstimo.
 * Quando devolucaoProdutoSimilar_empdev for true, o campo produtoSimilarId é obrigatório.
 *
 * @example
 * ```typescript
 * // POST /api/emprestimoItemDevolucoes
 * {
 *   "itemDevolucaoId": 1,
 *   "produtoDevolucaoId": 5,
 *   "datadevolucao_empdev": "2026-02-28",
 *   "quantidadedevolvida_empdev": 5.0,
 *   "devolucaoGeraFinanceiro_empdev": false,
 *   "devolucaoProdutoSimilar_empdev": false
 * }
 * ```
 */
export class CreateEmprestimoItemDevolucaoDto extends CreateDto {
  /**
   * ID do item do empréstimo que está sendo devolvido
   */
  @IsInt({ message: 'Item do empréstimo ID deve ser um número inteiro' })
  @Min(1, { message: 'Item do empréstimo ID deve ser maior que zero' })
  @IsNotEmpty({ message: 'Item do empréstimo ID é obrigatório' })
  @Validate(IsExists, ['EmprestimoItem', 'id'])
  itemDevolucaoId!: number;

  /**
   * ID do produto que está sendo devolvido
   */
  @IsInt({ message: 'Produto de devolução ID deve ser um número inteiro' })
  @Min(1, { message: 'Produto de devolução ID deve ser maior que zero' })
  @IsNotEmpty({ message: 'Produto de devolução ID é obrigatório' })
  @Validate(IsExists, ['Produto', 'id_prod'])
  produtoDevolucaoId!: number;

  /**
   * ID do produto similar devolvido
   * Obrigatório quando devolucaoProdutoSimilar_empdev for true
   */
  @IsOptional()
  @ValidateIf((o) => o.produtoSimilarId !== undefined && o.produtoSimilarId !== null)
  @IsInt({ message: 'Produto similar ID deve ser um número inteiro' })
  @Min(1, { message: 'Produto similar ID deve ser maior que zero' })
  @Validate(IsExists, ['Produto', 'id_prod'])
  @IsRequiredIf('devolucaoProdutoSimilar_empdev', true, {
    message: 'Produto similar ID é obrigatório quando a devolução é de produto similar',
  })
  produtoSimilarId?: number;

  /**
   * Data da devolução (formato: YYYY-MM-DD)
   */
  @IsDateString({}, { message: 'Data de devolução deve ser uma data válida no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data de devolução é obrigatória' })
  datadevolucao_empdev!: string;

  /**
   * Quantidade devolvida nesta operação
   */
  @IsNumber({}, { message: 'Quantidade devolvida deve ser um número' })
  @Min(0.001, { message: 'Quantidade devolvida deve ser maior que zero' })
  @IsNotEmpty({ message: 'Quantidade devolvida é obrigatória' })
  quantidadedevolvida_empdev!: number;

  /**
   * Indica se a devolução gera um lançamento financeiro
   */
  @IsBoolean({ message: 'O campo devolucaoGeraFinanceiro_empdev deve ser um booleano' })
  @IsNotEmpty({ message: 'O campo devolucaoGeraFinanceiro_empdev é obrigatório' })
  devolucaoGeraFinanceiro_empdev!: boolean;

  /**
   * Indica se a devolução é de produto similar ao emprestado
   */
  @IsBoolean({ message: 'O campo devolucaoProdutoSimilar_empdev deve ser um booleano' })
  @IsNotEmpty({ message: 'O campo devolucaoProdutoSimilar_empdev é obrigatório' })
  devolucaoProdutoSimilar_empdev!: boolean;
}
