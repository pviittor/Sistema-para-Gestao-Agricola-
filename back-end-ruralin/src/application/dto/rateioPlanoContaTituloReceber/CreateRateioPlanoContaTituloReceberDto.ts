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
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * CreateRateioPlanoContaTituloReceberDto - DTO para criação de rateio por plano de contas de título a receber
 * 
 * DTO usado no endpoint de criação de rateio por plano de contas de título a receber com todas as validações necessárias.
 */
export class CreateRateioPlanoContaTituloReceberDto extends CreateDto {
  /**
   * ID do título a receber ao qual o rateio pertence
   */
  @IsInt({ message: 'ID do título a receber deve ser um número inteiro' })
  @Min(1, { message: 'ID do título a receber deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID do título a receber é obrigatório' })
  @Validate(IsExists, ['TituloReceber', 'id'], { message: 'Título a receber não encontrado' })
  idTituloReceber!: number;

  /**
   * ID do plano de contas gerencial
   */
  @IsInt({ message: 'ID do plano de contas gerencial deve ser um número inteiro' })
  @Min(1, { message: 'ID do plano de contas gerencial deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID do plano de contas gerencial é obrigatório' })
  @Validate(IsExists, ['PlanoContaGerencial', 'id'], { message: 'Plano de contas gerencial não encontrado' })
  idPlanoContaGerencial!: number;

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
