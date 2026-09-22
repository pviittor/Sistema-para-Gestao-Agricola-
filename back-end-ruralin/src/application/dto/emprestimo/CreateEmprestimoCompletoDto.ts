import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEmprestimoDto } from './CreateEmprestimoDto';
import { EmprestimoItemSemIdDto } from '../emprestimoItem/EmprestimoItemSemIdDto';

/**
 * CreateEmprestimoCompletoDto - DTO para criação atômica de empréstimo com itens
 *
 * Estende CreateEmprestimoDto adicionando a coleção de itens obrigatória.
 * O serviço cria o empréstimo pai e os itens filhos em uma única transação.
 *
 * @example
 * ```typescript
 * // POST /api/emprestimos/completo
 * {
 *   "fazendaId": 1,
 *   "parceiroId": 10,
 *   "data_emp": "2026-02-28",
 *   "tipo_emp": 0,
 *   "itens": [
 *     { "produtoId": 5, "quantidade_empi": 10.5, "unitario_empi": 25.00 }
 *   ]
 * }
 * ```
 */
export class CreateEmprestimoCompletoDto extends CreateEmprestimoDto {
  /**
   * Lista de itens do empréstimo (mínimo 1 item obrigatório)
   */
  @IsArray({ message: 'Itens deve ser um array' })
  @ArrayMinSize(1, { message: 'Deve haver pelo menos um item no empréstimo' })
  @ValidateNested({ each: true })
  @Type(() => EmprestimoItemSemIdDto)
  itens!: EmprestimoItemSemIdDto[];
}
