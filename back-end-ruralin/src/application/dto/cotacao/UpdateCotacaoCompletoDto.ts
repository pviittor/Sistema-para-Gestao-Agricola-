import { IsArray, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { UpdateCotacaoDto } from './UpdateCotacaoDto'
import { CotacaoItemSemIdDto } from './CotacaoItemSemIdDto'

/**
 * UpdateCotacaoCompletoDto - DTO para atualizacao atomica de cotacao com itens
 *
 * Padrao master-detail: delete-and-recreate dos itens.
 */
export class UpdateCotacaoCompletoDto extends UpdateCotacaoDto {
  @IsOptional()
  @IsArray({ message: 'itens deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => CotacaoItemSemIdDto)
  itens?: CotacaoItemSemIdDto[]
}
