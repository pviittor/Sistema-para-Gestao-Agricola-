import { IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateEmprestimoDto } from './UpdateEmprestimoDto';
import { EmprestimoItemSemIdDto } from '../emprestimoItem/EmprestimoItemSemIdDto';

/**
 * UpdateEmprestimoCompletoDto - DTO para atualização atômica de empréstimo com itens
 *
 * Estende UpdateEmprestimoDto adicionando a coleção opcional de itens.
 * Quando fornecidos, os itens existentes são substituídos pelos novos (delete-and-recreate).
 *
 * @example
 * ```typescript
 * // PUT /api/emprestimos/:id/completo
 * {
 *   "observacao_emp": "Prazo prorrogado",
 *   "itens": [
 *     { "produtoId": 5, "quantidade_empi": 8.0, "unitario_empi": 25.00 }
 *   ]
 * }
 * ```
 */
export class UpdateEmprestimoCompletoDto extends UpdateEmprestimoDto {
  /**
   * Lista de itens do empréstimo.
   * Quando fornecida, substitui completamente os itens existentes (delete-and-recreate).
   */
  @IsOptional()
  @IsArray({ message: 'Itens deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => EmprestimoItemSemIdDto)
  itens?: EmprestimoItemSemIdDto[];
}
