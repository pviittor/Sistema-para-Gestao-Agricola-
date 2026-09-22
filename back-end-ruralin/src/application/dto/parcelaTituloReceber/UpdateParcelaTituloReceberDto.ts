import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
  Min,
  Validate,
  IsEnum,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';
import { StatusParcela } from '../../../models/ParcelaTituloReceber';

/**
 * UpdateParcelaTituloReceberDto - DTO para atualização de parcela de título a receber
 * 
 * DTO usado no endpoint de atualização de parcela de título a receber.
 * Todos os campos são opcionais.
 */
export class UpdateParcelaTituloReceberDto extends UpdateDto {
  /**
   * ID do título a receber ao qual a parcela pertence
   */
  @IsOptional()
  @IsInt({ message: 'ID do título a receber deve ser um número inteiro' })
  @Min(1, { message: 'ID do título a receber deve ser maior que zero' })
  @Validate(IsExists, ['TituloReceber', 'id'], { message: 'Título a receber não encontrado' })
  idTituloReceber?: number;

  /**
   * Número sequencial da parcela (1, 2, 3...)
   */
  @IsOptional()
  @IsInt({ message: 'Número da parcela deve ser um número inteiro' })
  @Min(1, { message: 'Número da parcela deve ser no mínimo 1' })
  numeroParcela?: number;

  /**
   * Data de vencimento da parcela
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data de vencimento deve ser uma data válida no formato YYYY-MM-DD' })
  dataVencimento?: string;

  /**
   * Valor da parcela
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor da parcela deve ser um número' })
  @Min(0.01, { message: 'Valor da parcela deve ser maior que zero' })
  valorParcela?: number;

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
