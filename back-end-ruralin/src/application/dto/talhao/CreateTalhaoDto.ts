import {
  IsInt,
  IsNumber,
  IsString,
  IsOptional,
  IsObject,
  MaxLength,
  Min,
  Validate,
  IsNotEmpty,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * CreateTalhaoDto - DTO para criação de talhão
 */
export class CreateTalhaoDto extends CreateDto {
  /**
   * Descrição do talhão
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  descricao!: string;

  /**
   * ID da fazenda
   */
  @IsInt({ message: 'ID da fazenda deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID da fazenda e obrigatorio' })
  @Min(1, { message: 'ID da fazenda deve ser maior que zero' })
  @Validate(IsExists, ['Fazenda', 'id'], { message: 'Fazenda nao encontrada' })
  idFazenda!: number;

  /**
   * Área do talhão
   */
  @IsNumber({}, { message: 'Area deve ser um numero' })
  @IsNotEmpty({ message: 'Area e obrigatoria' })
  @Min(0, { message: 'Area deve ser maior ou igual a zero' })
  area!: number;

  /**
   * GeoJSON Polygon do talhão
   */
  @IsOptional()
  @IsObject({ message: 'Geometry deve ser um objeto GeoJSON' })
  geometry?: object;

  /**
   * Grupo do talhão para organização
   */
  @IsOptional()
  @IsString({ message: 'Grupo deve ser uma string' })
  @MaxLength(100, { message: 'Grupo deve ter no máximo 100 caracteres' })
  grupo?: string;
}
