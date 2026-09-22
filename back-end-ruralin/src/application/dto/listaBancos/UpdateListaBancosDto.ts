import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';

/**
 * UpdateListaBancosDto - DTO para atualização de banco
 */
export class UpdateListaBancosDto extends UpdateDto {
  @IsString({ message: 'Código deve ser uma string' })
  @IsOptional()
  @MinLength(1, { message: 'Código deve ter no mínimo 1 caractere' })
  @MaxLength(10, { message: 'Código deve ter no máximo 10 caracteres' })
  codigo?: string;

  @IsString({ message: 'Nome deve ser uma string' })
  @IsOptional()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  nome?: string;
}
