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
 * UpdateRateioPlanoContaTituloPagarDto - DTO para atualização de rateio por plano de contas de título a pagar
 * 
 * DTO usado no endpoint de atualização de rateio por plano de contas de título a pagar.
 * Todos os campos são opcionais.
 */
export class UpdateRateioPlanoContaTituloPagarDto extends UpdateDto {
  /**
   * ID do título a pagar ao qual o rateio pertence
   */
  @IsOptional()
  @IsInt({ message: 'ID do título a pagar deve ser um número inteiro' })
  @Min(1, { message: 'ID do título a pagar deve ser maior que zero' })
  @Validate(IsExists, ['TituloPagar', 'id'], { message: 'Título a pagar não encontrado' })
  idTituloPagar?: number;

  /**
   * ID do plano de contas gerencial
   */
  @IsOptional()
  @IsInt({ message: 'ID do plano de contas gerencial deve ser um número inteiro' })
  @Min(1, { message: 'ID do plano de contas gerencial deve ser maior que zero' })
  @Validate(IsExists, ['PlanoContaGerencial', 'id'], { message: 'Plano de contas gerencial não encontrado' })
  idPlanoContaGerencial?: number;

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
