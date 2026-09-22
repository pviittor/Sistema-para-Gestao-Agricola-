/**
 * CreateConsultoriaDto - DTO para criação de consultoria
 * 
 * DTO usado no endpoint de criação de consultoria com todas as validações necessárias.
 */

import {
  IsString,
  IsOptional,
  IsEmail,
  IsInt,
  Min,
  MaxLength,
  Matches,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsUnique } from '../../validators/IsUnique';

export class CreateConsultoriaDto extends CreateDto {
  /**
   * Razão social da consultoria
   */
  @IsString({ message: 'Razão social deve ser uma string' })
  @MaxLength(255, { message: 'Razão social deve ter no máximo 255 caracteres' })
  razaoSocial!: string;

  /**
   * Nome fantasia da consultoria
   */
  @IsString({ message: 'Nome fantasia deve ser uma string' })
  @IsOptional()
  @MaxLength(255, { message: 'Nome fantasia deve ter no máximo 255 caracteres' })
  nomeFantasia?: string;

  /**
   * CNPJ da consultoria (único)
   */
  @IsString({ message: 'CNPJ deve ser uma string' })
  @Matches(/^\d{14}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, {
    message: 'CNPJ deve estar no formato válido (14 dígitos ou XX.XXX.XXX/XXXX-XX)',
  })
  @IsUnique('Consultoria', 'cnpj', undefined, { message: 'CNPJ já cadastrado' })
  cnpj!: string;

  /**
   * Email de contato da consultoria
   */
  @IsEmail({}, { message: 'Email deve ser um email válido' })
  @MaxLength(255, { message: 'Email deve ter no máximo 255 caracteres' })
  email!: string;

  /**
   * Telefone de contato da consultoria
   */
  @IsString({ message: 'Telefone deve ser uma string' })
  @IsOptional()
  @MaxLength(20, { message: 'Telefone deve ter no máximo 20 caracteres' })
  telefone?: string;

  /**
   * Limite de tenants permitidos
   */
  @IsInt({ message: 'Limite de tenants deve ser um número inteiro' })
  @Min(1, { message: 'Limite de tenants deve ser no mínimo 1' })
  @IsOptional()
  limiteTenants?: number;
}
