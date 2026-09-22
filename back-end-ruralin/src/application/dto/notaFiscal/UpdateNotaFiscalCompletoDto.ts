import { IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateNotaFiscalDto } from './UpdateNotaFiscalDto';
import { ItemNotaFiscalSemIdDto } from '../itemNotaFiscal/ItemNotaFiscalSemIdDto';

/**
 * UpdateNotaFiscalCompletoDto - DTO para atualizacao atomica de nota fiscal com seus itens
 *
 * Padrao master-detail: atualiza a nota e recria todos os itens em uma unica transacao.
 * Quando itens e fornecido, todos os itens existentes sao removidos e substituidos.
 */
export class UpdateNotaFiscalCompletoDto extends UpdateNotaFiscalDto {
  @IsOptional()
  @IsArray({ message: 'Itens deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => ItemNotaFiscalSemIdDto)
  itens?: ItemNotaFiscalSemIdDto[];
}
