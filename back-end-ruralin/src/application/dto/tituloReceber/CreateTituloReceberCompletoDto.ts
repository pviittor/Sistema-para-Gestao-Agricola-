import {
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTituloReceberDto } from './CreateTituloReceberDto';
import { ParcelaTituloReceberSemIdDto } from './ParcelaTituloReceberSemIdDto';
import { RateioPlanoContaReceberSemIdDto } from './RateioPlanoContaReceberSemIdDto';
import { RateioCentroCustoReceberSemIdDto } from './RateioCentroCustoReceberSemIdDto';

/**
 * CreateTituloReceberCompletoDto - DTO para criação completa de título a receber
 *
 * DTO usado para criar um título a receber com parcelas e rateios em uma única requisição.
 * O idTituloReceber nas parcelas e rateios será preenchido automaticamente após a criação do título.
 */
export class CreateTituloReceberCompletoDto extends CreateTituloReceberDto {
  /**
   * Array de parcelas do título
   * O idTituloReceber será preenchido automaticamente, não precisa ser informado
   */
  @IsArray({ message: 'Parcelas deve ser um array' })
  @ArrayMinSize(1, { message: 'Deve haver pelo menos uma parcela' })
  @ValidateNested({ each: true })
  @Type(() => ParcelaTituloReceberSemIdDto)
  parcelas!: ParcelaTituloReceberSemIdDto[];

  /**
   * Array de rateios por plano de contas (opcional)
   * O idTituloReceber será preenchido automaticamente, não precisa ser informado
   */
  @IsArray({ message: 'Rateios por plano de contas deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => RateioPlanoContaReceberSemIdDto)
  rateiosPlanoConta?: RateioPlanoContaReceberSemIdDto[];

  /**
   * Array de rateios por centro de custo (opcional)
   * O idTituloReceber será preenchido automaticamente, não precisa ser informado
   */
  @IsArray({ message: 'Rateios por centro de custo deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => RateioCentroCustoReceberSemIdDto)
  rateiosCentroCusto?: RateioCentroCustoReceberSemIdDto[];
}
