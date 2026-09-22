import {
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
  IsString,
  Min,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdateBenfeitoriaDto - DTO para atualizacao de benfeitoria
 *
 * Todos os campos sao opcionais, permitindo atualizacoes parciais.
 */
export class UpdateBenfeitoriaDto extends UpdateDto {
  /**
   * Descricao da benfeitoria
   */
  @IsOptional()
  @IsString({ message: 'Descricao deve ser uma string' })
  descricao?: string;

  /**
   * Valor total da benfeitoria
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor total deve ser um numero' })
  @Min(0, { message: 'Valor total deve ser maior ou igual a zero' })
  valortotal?: number;

  /**
   * Vida util em anos
   */
  @IsOptional()
  @IsInt({ message: 'Vida util deve ser um numero inteiro' })
  @Min(0, { message: 'Vida util deve ser maior ou igual a zero' })
  vidautil?: number;

  /**
   * Percentual de sucata
   */
  @IsOptional()
  @IsNumber({}, { message: 'Percentual de sucata deve ser um numero' })
  @Min(0, { message: 'Percentual de sucata deve ser maior ou igual a zero' })
  percsucata?: number;

  /**
   * Depreciacao anual
   */
  @IsOptional()
  @IsNumber({}, { message: 'Depreciacao anual deve ser um numero' })
  @Min(0, { message: 'Depreciacao anual deve ser maior ou igual a zero' })
  depreciacaoano?: number;

  /**
   * Taxa de manutencao
   */
  @IsOptional()
  @IsNumber({}, { message: 'Taxa de manutencao deve ser um numero' })
  @Min(0, { message: 'Taxa de manutencao deve ser maior ou igual a zero' })
  taxamanutencao?: number;

  /**
   * Manutencao anual
   */
  @IsOptional()
  @IsNumber({}, { message: 'Manutencao anual deve ser um numero' })
  @Min(0, { message: 'Manutencao anual deve ser maior ou igual a zero' })
  manutencaoano?: number;

  /**
   * ID da fazenda
   */
  @IsOptional()
  @IsInt({ message: 'ID da fazenda deve ser um numero inteiro' })
  @Min(1, { message: 'ID da fazenda deve ser maior que zero' })
  @Validate(IsExists, ['Fazenda', 'id'], { message: 'Fazenda nao encontrada' })
  idFazenda?: number;

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
