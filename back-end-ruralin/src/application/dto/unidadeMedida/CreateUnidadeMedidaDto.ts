import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { CreateDto } from '../CreateDto';

/**
 * CreateUnidadeMedidaDto - DTO para criação de unidade de medida
 * 
 * DTO usado no endpoint de criação de unidade de medida com todas as validações necessárias.
 */
export class CreateUnidadeMedidaDto extends CreateDto {
  /**
   * Descrição da unidade de medida
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  descricao_unidade!: string;

  /**
   * Abreviatura da unidade de medida
   */
  @IsString({ message: 'Abreviatura deve ser uma string' })
  @IsOptional()
  @MinLength(1, { message: 'Abreviatura deve ter no mínimo 1 caractere' })
  @MaxLength(20, { message: 'Abreviatura deve ter no máximo 20 caracteres' })
  abreviatura_unidade?: string;
}
