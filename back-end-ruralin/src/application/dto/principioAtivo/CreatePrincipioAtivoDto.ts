import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { CreateDto } from '../CreateDto';

/**
 * CreatePrincipioAtivoDto - DTO para criação de princípio ativo
 * 
 * DTO usado no endpoint de criação de princípio ativo com todas as validações necessárias.
 */
export class CreatePrincipioAtivoDto extends CreateDto {
  /**
   * Descrição do princípio ativo
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  descricao_principio!: string;

  /**
   * Classe do princípio ativo
   */
  @IsString({ message: 'Classe deve ser uma string' })
  @IsOptional()
  @MinLength(1, { message: 'Classe deve ter no mínimo 1 caractere' })
  @MaxLength(100, { message: 'Classe deve ter no máximo 100 caracteres' })
  classe_principio?: string;
}
