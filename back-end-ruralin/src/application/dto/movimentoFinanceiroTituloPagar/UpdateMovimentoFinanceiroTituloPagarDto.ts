import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsDateString,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdateMovimentoFinanceiroTituloPagarDto - DTO para atualização de movimento financeiro de título a pagar
 * 
 * DTO usado no endpoint de atualização de movimento financeiro de título a pagar.
 * Todos os campos são opcionais.
 */
export class UpdateMovimentoFinanceiroTituloPagarDto extends UpdateDto {
  /**
   * ID da parcela do título a pagar que foi baixada
   */
  @IsOptional()
  @IsInt({ message: 'ID da parcela do título a pagar deve ser um número inteiro' })
  @Min(1, { message: 'ID da parcela do título a pagar deve ser maior que zero' })
  @Validate(IsExists, ['ParcelaTituloPagar', 'id'], { message: 'Parcela do título a pagar não encontrada' })
  idParcelaTituloPagar?: number;

  /**
   * ID do título a pagar (redundante para performance)
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
   * ID do centro de custo
   */
  @IsOptional()
  @IsInt({ message: 'ID do centro de custo deve ser um número inteiro' })
  @Min(1, { message: 'ID do centro de custo deve ser maior que zero' })
  @Validate(IsExists, ['CentroCusto', 'id'], { message: 'Centro de custo não encontrado' })
  idCentroCusto?: number;

  /**
   * Data do movimento (data da baixa)
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data do movimento deve ser uma data válida no formato ISO' })
  dataMovimento?: string;

  /**
   * Valor do movimento (valor rateado proporcional)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor do movimento deve ser um número' })
  @Min(0.01, { message: 'Valor do movimento deve ser maior que zero' })
  valorMovimento?: number;

  /**
   * Valor do movimento na moeda original do título
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor do movimento na moeda original deve ser um número' })
  @Min(0, { message: 'Valor do movimento na moeda original deve ser maior ou igual a zero' })
  valorMovimentoMoedaOriginal?: number;

  /**
   * Valor do movimento convertido para moeda padrão (BRL)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor do movimento na moeda padrão deve ser um número' })
  @Min(0, { message: 'Valor do movimento na moeda padrão deve ser maior ou igual a zero' })
  valorMovimentoMoedaPadrao?: number;

  /**
   * Percentual do rateio do plano de contas (do rateio original do título)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Percentual do rateio do plano de contas deve ser um número' })
  @Min(0, { message: 'Percentual do rateio do plano de contas deve ser maior ou igual a zero' })
  @Max(100, { message: 'Percentual do rateio do plano de contas deve ser menor ou igual a 100' })
  percentualRateioPlanoConta?: number;

  /**
   * Percentual do rateio do centro de custo (do rateio original do título)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Percentual do rateio do centro de custo deve ser um número' })
  @Min(0, { message: 'Percentual do rateio do centro de custo deve ser maior ou igual a zero' })
  @Max(100, { message: 'Percentual do rateio do centro de custo deve ser menor ou igual a 100' })
  percentualRateioCentroCusto?: number;

  /**
   * Observações sobre o movimento
   */
  @IsOptional()
  @IsString({ message: 'Observação deve ser uma string' })
  observacao?: string;
}
