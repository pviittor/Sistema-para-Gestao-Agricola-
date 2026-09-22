import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';

/**
 * UpdatePrincipioAtivoDto - DTO para atualização de princípio ativo
 * 
 * DTO usado no endpoint de atualização de princípio ativo.
 * Todos os campos são opcionais.
 */
export class UpdatePrincipioAtivoDto extends UpdateDto {
  /**
   * Descrição do princípio ativo
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  @IsOptional()
  descricao_principio?: string;

  /**
   * Classe do princípio ativo
   */
  @IsString({ message: 'Classe deve ser uma string' })
  @MinLength(1, { message: 'Classe deve ter no mínimo 1 caractere' })
  @MaxLength(100, { message: 'Classe deve ter no máximo 100 caracteres' })
  @IsOptional()
  classe_principio?: string;
}
