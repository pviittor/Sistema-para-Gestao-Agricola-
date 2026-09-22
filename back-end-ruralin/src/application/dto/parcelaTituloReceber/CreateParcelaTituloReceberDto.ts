import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
  Min,
  IsNotEmpty,
  Validate,
  IsEnum,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';
import { StatusParcela } from '../../../models/ParcelaTituloReceber';

/**
 * CreateParcelaTituloReceberDto - DTO para criação de parcela de título a receber
 * 
 * DTO usado no endpoint de criação de parcela de título a receber com todas as validações necessárias.
 */
export class CreateParcelaTituloReceberDto extends CreateDto {
  /**
   * ID do título a receber ao qual a parcela pertence
   */
  @IsInt({ message: 'ID do título a receber deve ser um número inteiro' })
  @Min(1, { message: 'ID do título a receber deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID do título a receber é obrigatório' })
  @Validate(IsExists, ['TituloReceber', 'id'], { message: 'Título a receber não encontrado' })
  idTituloReceber!: number;

  /**
   * Número sequencial da parcela (1, 2, 3...)
   */
  @IsInt({ message: 'Número da parcela deve ser um número inteiro' })
  @Min(1, { message: 'Número da parcela deve ser no mínimo 1' })
  @IsNotEmpty({ message: 'Número da parcela é obrigatório' })
  numeroParcela!: number;

  /**
   * Data de vencimento da parcela
   */
  @IsDateString({}, { message: 'Data de vencimento deve ser uma data válida no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data de vencimento é obrigatória' })
  dataVencimento!: string;

  /**
   * Valor da parcela
   */
  @IsNumber({}, { message: 'Valor da parcela deve ser um número' })
  @Min(0.01, { message: 'Valor da parcela deve ser maior que zero' })
  @IsNotEmpty({ message: 'Valor da parcela é obrigatório' })
  valorParcela!: number;

  /**
   * Valor da parcela na moeda original
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor na moeda original deve ser um número' })
  @Min(0, { message: 'Valor na moeda original deve ser maior ou igual a zero' })
  valorParcelaMoedaOriginal?: number;

  /**
   * Valor da parcela convertido para moeda padrão (BRL)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor na moeda padrão deve ser um número' })
  @Min(0, { message: 'Valor na moeda padrão deve ser maior ou igual a zero' })
  valorParcelaMoedaPadrao?: number;

  /**
   * Data de baixa da parcela (preenchida quando a parcela é baixada)
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data de baixa deve ser uma data válida no formato YYYY-MM-DD' })
  dataBaixa?: string;

  /**
   * Valor da baixa (preenchido quando a parcela é baixada)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor da baixa deve ser um número' })
  @Min(0, { message: 'Valor da baixa deve ser maior ou igual a zero' })
  valorBaixa?: number;

  /**
   * Status da parcela
   */
  @IsOptional()
  @IsEnum(StatusParcela, { message: 'Status deve ser ABERTA, BAIXADA ou CANCELADA' })
  status?: StatusParcela;

  /**
   * Observações sobre a parcela
   */
  @IsOptional()
  @IsString({ message: 'Observação deve ser uma string' })
  observacao?: string;
}
