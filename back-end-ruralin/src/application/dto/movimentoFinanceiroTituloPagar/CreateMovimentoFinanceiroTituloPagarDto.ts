import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsNotEmpty,
  IsDateString,
  Validate,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * CreateMovimentoFinanceiroTituloPagarDto - DTO para criação de movimento financeiro de título a pagar
 * 
 * DTO usado no endpoint de criação de movimento financeiro de título a pagar com todas as validações necessárias.
 * Nota: Movimentos financeiros são geralmente criados automaticamente na baixa de parcelas,
 * mas este DTO permite criação manual se necessário.
 */
export class CreateMovimentoFinanceiroTituloPagarDto extends CreateDto {
  /**
   * ID da parcela do título a pagar que foi baixada
   */
  @IsInt({ message: 'ID da parcela do título a pagar deve ser um número inteiro' })
  @Min(1, { message: 'ID da parcela do título a pagar deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID da parcela do título a pagar é obrigatório' })
  @Validate(IsExists, ['ParcelaTituloPagar', 'id'], { message: 'Parcela do título a pagar não encontrada' })
  idParcelaTituloPagar!: number;

  /**
   * ID do título a pagar (redundante para performance)
   */
  @IsInt({ message: 'ID do título a pagar deve ser um número inteiro' })
  @Min(1, { message: 'ID do título a pagar deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID do título a pagar é obrigatório' })
  @Validate(IsExists, ['TituloPagar', 'id'], { message: 'Título a pagar não encontrado' })
  idTituloPagar!: number;

  /**
   * ID do plano de contas gerencial
   */
  @IsInt({ message: 'ID do plano de contas gerencial deve ser um número inteiro' })
  @Min(1, { message: 'ID do plano de contas gerencial deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID do plano de contas gerencial é obrigatório' })
  @Validate(IsExists, ['PlanoContaGerencial', 'id'], { message: 'Plano de contas gerencial não encontrado' })
  idPlanoContaGerencial!: number;

  /**
   * ID do centro de custo
   */
  @IsInt({ message: 'ID do centro de custo deve ser um número inteiro' })
  @Min(1, { message: 'ID do centro de custo deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID do centro de custo é obrigatório' })
  @Validate(IsExists, ['CentroCusto', 'id'], { message: 'Centro de custo não encontrado' })
  idCentroCusto!: number;

  /**
   * Data do movimento (data da baixa)
   */
  @IsDateString({}, { message: 'Data do movimento deve ser uma data válida no formato ISO' })
  @IsNotEmpty({ message: 'Data do movimento é obrigatória' })
  dataMovimento!: string;

  /**
   * Valor do movimento (valor rateado proporcional)
   */
  @IsNumber({}, { message: 'Valor do movimento deve ser um número' })
  @Min(0.01, { message: 'Valor do movimento deve ser maior que zero' })
  @IsNotEmpty({ message: 'Valor do movimento é obrigatório' })
  valorMovimento!: number;

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
  @IsNumber({}, { message: 'Percentual do rateio do plano de contas deve ser um número' })
  @Min(0, { message: 'Percentual do rateio do plano de contas deve ser maior ou igual a zero' })
  @Max(100, { message: 'Percentual do rateio do plano de contas deve ser menor ou igual a 100' })
  @IsNotEmpty({ message: 'Percentual do rateio do plano de contas é obrigatório' })
  percentualRateioPlanoConta!: number;

  /**
   * Percentual do rateio do centro de custo (do rateio original do título)
   */
  @IsNumber({}, { message: 'Percentual do rateio do centro de custo deve ser um número' })
  @Min(0, { message: 'Percentual do rateio do centro de custo deve ser maior ou igual a zero' })
  @Max(100, { message: 'Percentual do rateio do centro de custo deve ser menor ou igual a 100' })
  @IsNotEmpty({ message: 'Percentual do rateio do centro de custo é obrigatório' })
  percentualRateioCentroCusto!: number;

  /**
   * Observações sobre o movimento
   */
  @IsOptional()
  @IsString({ message: 'Observação deve ser uma string' })
  observacao?: string;
}
