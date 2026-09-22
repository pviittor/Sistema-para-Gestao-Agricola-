import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { CreateDto } from '../CreateDto';

/**
 * CreateListaBancosDto - DTO para criação de banco
 */
export class CreateListaBancosDto extends CreateDto {
  /**
   * Código do banco (ex: 001, 237)
   */
  @IsString({ message: 'Código deve ser uma string' })
  @IsNotEmpty({ message: 'Código é obrigatório' })
  @MinLength(1, { message: 'Código deve ter no mínimo 1 caractere' })
  @MaxLength(10, { message: 'Código deve ter no máximo 10 caracteres' })
  codigo!: string;

  /**
   * Nome do banco
   */
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  nome!: string;
}
