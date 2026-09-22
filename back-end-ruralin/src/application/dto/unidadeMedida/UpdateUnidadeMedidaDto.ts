import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';

/**
 * UpdateUnidadeMedidaDto - DTO para atualização de unidade de medida
 * 
 * DTO usado no endpoint de atualização de unidade de medida.
 * Todos os campos são opcionais.
 */
export class UpdateUnidadeMedidaDto extends UpdateDto {
  /**
   * Descrição da unidade de medida
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  @IsOptional()
  descricao_unidade?: string;

  /**
   * Abreviatura da unidade de medida
   */
  @IsString({ message: 'Abreviatura deve ser uma string' })
  @MinLength(1, { message: 'Abreviatura deve ter no mínimo 1 caractere' })
  @MaxLength(20, { message: 'Abreviatura deve ter no máximo 20 caracteres' })
  @IsOptional()
  abreviatura_unidade?: string;
}
