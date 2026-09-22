import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { CreateCotacaoDto } from './CreateCotacaoDto'
import { CotacaoItemSemIdDto } from './CotacaoItemSemIdDto'

/**
 * CreateCotacaoCompletoDto - DTO para criacao atomica de cotacao com itens
 *
 * Padrao master-detail: estende CreateCotacaoDto adicionando array de itens.
 */
export class CreateCotacaoCompletoDto extends CreateCotacaoDto {
  @IsArray({ message: 'itens deve ser um array' })
  @ArrayMinSize(1, { message: 'Deve haver pelo menos um item na cotacao' })
  @ValidateNested({ each: true })
  @Type(() => CotacaoItemSemIdDto)
  itens!: CotacaoItemSemIdDto[]
}
