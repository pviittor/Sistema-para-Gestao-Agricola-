import {
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTituloPagarDto } from './CreateTituloPagarDto';
import { ParcelaTituloPagarSemIdDto } from './ParcelaTituloPagarSemIdDto';
import { RateioPlanoContaSemIdDto } from './RateioPlanoContaSemIdDto';
import { RateioCentroCustoSemIdDto } from './RateioCentroCustoSemIdDto';

/**
 * CreateTituloPagarCompletoDto - DTO para criação completa de título a pagar
 * 
 * DTO usado para criar um título a pagar com parcelas e rateios em uma única requisição.
 * O idTituloPagar nas parcelas e rateios será preenchido automaticamente após a criação do título.
 */
export class CreateTituloPagarCompletoDto extends CreateTituloPagarDto {
  /**
   * Array de parcelas do título
   * O idTituloPagar será preenchido automaticamente, não precisa ser informado
   */
  @IsArray({ message: 'Parcelas deve ser um array' })
  @ArrayMinSize(1, { message: 'Deve haver pelo menos uma parcela' })
  @ValidateNested({ each: true })
  @Type(() => ParcelaTituloPagarSemIdDto)
  parcelas!: ParcelaTituloPagarSemIdDto[];

  /**
   * Array de rateios por plano de contas (opcional)
   * O idTituloPagar será preenchido automaticamente, não precisa ser informado
   */
  @IsArray({ message: 'Rateios por plano de contas deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => RateioPlanoContaSemIdDto)
  rateiosPlanoConta?: RateioPlanoContaSemIdDto[];

  /**
   * Array de rateios por centro de custo (opcional)
   * O idTituloPagar será preenchido automaticamente, não precisa ser informado
   */
  @IsArray({ message: 'Rateios por centro de custo deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => RateioCentroCustoSemIdDto)
  rateiosCentroCusto?: RateioCentroCustoSemIdDto[];
}
