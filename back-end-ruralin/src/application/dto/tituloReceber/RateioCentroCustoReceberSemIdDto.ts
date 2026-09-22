import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsNotEmpty,
  Validate,
} from 'class-validator';
import { IsExists } from '../../validators/IsExists';

/**
 * RateioCentroCustoReceberSemIdDto - DTO para rateio de centro de custo sem idTituloReceber
 *
 * Usado no CreateTituloReceberParceladoDto onde o idTituloReceber será preenchido automaticamente
 */
export class RateioCentroCustoReceberSemIdDto {
  /**
   * ID do centro de custo
   */
  @IsInt({ message: 'ID do centro de custo deve ser um número inteiro' })
  @Min(1, { message: 'ID do centro de custo deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID do centro de custo é obrigatório' })
  @Validate(IsExists, ['CentroCusto', 'id'], { message: 'Centro de custo não encontrado' })
  idCentroCusto!: number;

  /**
   * Valor do rateio
   */
  @IsNumber({}, { message: 'Valor do rateio deve ser um número' })
  @Min(0.01, { message: 'Valor do rateio deve ser maior que zero' })
  @IsNotEmpty({ message: 'Valor do rateio é obrigatório' })
  valorRateio!: number;

  /**
   * Percentual do rateio (calculado automaticamente, mas pode ser informado)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Percentual do rateio deve ser um número' })
  @Min(0, { message: 'Percentual do rateio deve ser maior ou igual a zero' })
  @Max(100, { message: 'Percentual do rateio deve ser menor ou igual a 100' })
  percentualRateio?: number;

  /**
   * Observações sobre o rateio
   */
  @IsOptional()
  @IsString({ message: 'Observação deve ser uma string' })
  observacao?: string;
}
