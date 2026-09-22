import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateNotaFiscalDto } from './CreateNotaFiscalDto';
import { ItemNotaFiscalSemIdDto } from '../itemNotaFiscal/ItemNotaFiscalSemIdDto';

/**
 * CreateNotaFiscalCompletoDto - DTO para criacao atomica de nota fiscal com seus itens
 *
 * Padrao master-detail: cria a nota e todos os seus itens em uma unica transacao.
 */
export class CreateNotaFiscalCompletoDto extends CreateNotaFiscalDto {
  @IsArray({ message: 'Itens deve ser um array' })
  @ArrayMinSize(1, { message: 'Deve haver pelo menos um item na nota fiscal' })
  @ValidateNested({ each: true })
  @Type(() => ItemNotaFiscalSemIdDto)
  itens!: ItemNotaFiscalSemIdDto[];
}
