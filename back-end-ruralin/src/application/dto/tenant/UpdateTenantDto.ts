/**
 * UpdateTenantDto - DTO para atualização de tenant
 * 
 * DTO usado no endpoint de atualização de tenant.
 * Todos os campos são opcionais.
 */

import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  Matches,
  IsObject,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsUnique } from '../../validators/IsUnique';

export class UpdateTenantDto extends UpdateDto {
  /**
   * Nome do tenant
   */
  @IsString({ message: 'Nome deve ser uma string' })
  @IsOptional()
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  nome?: string;

  /**
   * Slug único do tenant (para URLs/subdomínios)
   */
  @IsString({ message: 'Slug deve ser uma string' })
  @IsOptional()
  @MaxLength(255, { message: 'Slug deve ter no máximo 255 caracteres' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug deve conter apenas letras minúsculas, números e hífens',
  })
  @IsUnique('Tenant', 'slug', 'id', { message: 'Slug já cadastrado' })
  slug?: string;

  /**
   * Configurações específicas do tenant (JSON)
   */
  @IsObject({ message: 'Configurações devem ser um objeto JSON' })
  @IsOptional()
  configuracoes?: Record<string, any>;

  /**
   * Limite de usuários permitidos
   */
  @IsInt({ message: 'Limite de usuários deve ser um número inteiro' })
  @Min(1, { message: 'Limite de usuários deve ser no mínimo 1' })
  @IsOptional()
  limiteUsuarios?: number;
}
