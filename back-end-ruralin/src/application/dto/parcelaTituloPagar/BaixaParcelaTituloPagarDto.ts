import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  IsNotEmpty,
} from 'class-validator';

/**
 * BaixaParcelaTituloPagarDto - DTO para baixa de parcela de título a pagar
 * 
 * DTO usado no endpoint de baixa de parcela de título a pagar.
 * Utilizado para realizar a baixa parcial ou total de uma parcela.
 */
export class BaixaParcelaTituloPagarDto {
  /**
   * Data da baixa
   */
  @IsDateString({}, { message: 'Data de baixa deve ser uma data válida no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data de baixa é obrigatória' })
  dataBaixa!: string;

  /**
   * Valor da baixa (pode ser parcial ou total)
   */
  @IsNumber({}, { message: 'Valor da baixa deve ser um número' })
  @Min(0.01, { message: 'Valor da baixa deve ser maior que zero' })
  @IsNotEmpty({ message: 'Valor da baixa é obrigatório' })
  valorBaixa!: number;

  /**
   * Observações sobre a baixa
   */
  @IsOptional()
  @IsString({ message: 'Observação deve ser uma string' })
  observacao?: string;
}
