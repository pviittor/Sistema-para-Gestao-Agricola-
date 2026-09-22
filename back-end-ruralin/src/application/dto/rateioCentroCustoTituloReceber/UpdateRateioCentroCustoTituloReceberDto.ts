import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  Min,
  Max,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdateRateioCentroCustoTituloReceberDto - DTO para atualização de rateio por centro de custo de título a receber
 * 
 * DTO usado no endpoint de atualização de rateio por centro de custo de título a receber.
 * Todos os campos são opcionais.
 */
export class UpdateRateioCentroCustoTituloReceberDto extends UpdateDto {
  /**
   * ID do título a receber ao qual o rateio pertence
   */
  @IsOptional()
  @IsInt({ message: 'ID do título a receber deve ser um número inteiro' })
  @Min(1, { message: 'ID do título a receber deve ser maior que zero' })
  @Validate(IsExists, ['TituloReceber', 'id'], { message: 'Título a receber não encontrado' })
  idTituloReceber?: number;

  /**
   * ID do centro de custo
   */
  @IsOptional()
  @IsInt({ message: 'ID do centro de custo deve ser um número inteiro' })
  @Min(1, { message: 'ID do centro de custo deve ser maior que zero' })
  @Validate(IsExists, ['CentroCusto', 'id'], { message: 'Centro de custo não encontrado' })
  idCentroCusto?: number;

  /**
   * Valor do rateio
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor do rateio deve ser um número' })
  @Min(0.01, { message: 'Valor do rateio deve ser maior que zero' })
  valorRateio?: number;

  /**
   * Percentual do rateio
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
