import {
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
  IsString,
  Min,
  Validate,
  IsNotEmpty,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * CreateBenfeitoriaDto - DTO para criacao de benfeitoria
 */
export class CreateBenfeitoriaDto extends CreateDto {
  /**
   * Descricao da benfeitoria
   */
  @IsString({ message: 'Descricao deve ser uma string' })
  @IsNotEmpty({ message: 'Descricao e obrigatoria' })
  descricao!: string;

  /**
   * Valor total da benfeitoria
   */
  @IsNumber({}, { message: 'Valor total deve ser um numero' })
  @IsNotEmpty({ message: 'Valor total e obrigatorio' })
  @Min(0, { message: 'Valor total deve ser maior ou igual a zero' })
  valortotal!: number;

  /**
   * Vida util em anos
   */
  @IsInt({ message: 'Vida util deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'Vida util e obrigatoria' })
  @Min(0, { message: 'Vida util deve ser maior ou igual a zero' })
  vidautil!: number;

  /**
   * Percentual de sucata
   */
  @IsNumber({}, { message: 'Percentual de sucata deve ser um numero' })
  @IsNotEmpty({ message: 'Percentual de sucata e obrigatorio' })
  @Min(0, { message: 'Percentual de sucata deve ser maior ou igual a zero' })
  percsucata!: number;

  /**
   * Depreciacao anual
   */
  @IsNumber({}, { message: 'Depreciacao anual deve ser um numero' })
  @IsNotEmpty({ message: 'Depreciacao anual e obrigatoria' })
  @Min(0, { message: 'Depreciacao anual deve ser maior ou igual a zero' })
  depreciacaoano!: number;

  /**
   * Taxa de manutencao
   */
  @IsNumber({}, { message: 'Taxa de manutencao deve ser um numero' })
  @IsNotEmpty({ message: 'Taxa de manutencao e obrigatoria' })
  @Min(0, { message: 'Taxa de manutencao deve ser maior ou igual a zero' })
  taxamanutencao!: number;

  /**
   * Manutencao anual
   */
  @IsNumber({}, { message: 'Manutencao anual deve ser um numero' })
  @IsNotEmpty({ message: 'Manutencao anual e obrigatoria' })
  @Min(0, { message: 'Manutencao anual deve ser maior ou igual a zero' })
  manutencaoano!: number;

  /**
   * ID da fazenda
   */
  @IsInt({ message: 'ID da fazenda deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID da fazenda e obrigatorio' })
  @Min(1, { message: 'ID da fazenda deve ser maior que zero' })
  @Validate(IsExists, ['Fazenda', 'id'], { message: 'Fazenda nao encontrada' })
  idFazenda!: number;

  /**
   * ID da unidade de medida
   */
  @IsOptional()
  @IsInt({ message: 'ID da unidade de medida deve ser um numero inteiro' })
  @Min(1, { message: 'ID da unidade de medida deve ser maior que zero' })
  @Validate(IsExists, ['UnidadeMedida', 'id_unidade'], { message: 'Unidade de medida nao encontrada' })
  idUnidadeMedida?: number;

  /**
   * ID da safra
   */
  @IsOptional()
  @IsInt({ message: 'ID da safra deve ser um numero inteiro' })
  @Min(1, { message: 'ID da safra deve ser maior que zero' })
  @Validate(IsExists, ['Safra', 'id'], { message: 'Safra nao encontrada' })
  idSafra?: number;

  /**
   * Data da benfeitoria
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data deve ser uma data valida no formato YYYY-MM-DD' })
  data?: string;

  /**
   * Observacoes adicionais
   */
  @IsOptional()
  @IsString({ message: 'Observacao deve ser uma string' })
  observacao?: string;
}
