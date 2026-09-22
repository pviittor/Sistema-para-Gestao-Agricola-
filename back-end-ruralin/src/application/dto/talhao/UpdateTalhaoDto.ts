import {
  IsOptional,
  IsInt,
  IsNumber,
  IsString,
  IsObject,
  MaxLength,
  Min,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdateTalhaoDto - DTO para atualização de talhão
 *
 * Todos os campos são opcionais, permitindo atualizações parciais.
 */
export class UpdateTalhaoDto extends UpdateDto {
  /**
   * Descrição do talhão
   */
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  descricao?: string;

  /**
   * ID da fazenda
   */
  @IsOptional()
  @IsInt({ message: 'ID da fazenda deve ser um numero inteiro' })
  @Min(1, { message: 'ID da fazenda deve ser maior que zero' })
  @Validate(IsExists, ['Fazenda', 'id'], { message: 'Fazenda nao encontrada' })
  idFazenda?: number;

  /**
   * Área do talhão
   */
  @IsOptional()
  @IsNumber({}, { message: 'Area deve ser um numero' })
  @Min(0, { message: 'Area deve ser maior ou igual a zero' })
  area?: number;

  /**
   * GeoJSON Polygon do talhão
   */
  @IsOptional()
  @IsObject({ message: 'Geometry deve ser um objeto GeoJSON' })
  geometry?: object | null;

  /**
   * Grupo do talhão para organização
   */
  @IsOptional()
  @IsString({ message: 'Grupo deve ser uma string' })
  @MaxLength(100, { message: 'Grupo deve ter no máximo 100 caracteres' })
  grupo?: string | null;
}
