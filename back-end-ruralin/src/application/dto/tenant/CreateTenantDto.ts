/**
 * CreateTenantDto - DTO para criação de tenant
 * 
 * DTO usado no endpoint de criação de tenant com todas as validações necessárias.
 */

import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  Matches,
  IsObject,
  ValidateIf,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsUnique } from '../../validators/IsUnique';
import { IsExists } from '../../validators/IsExists';

export class CreateTenantDto extends CreateDto {
  /**
   * Nome do tenant
   */
  @IsString({ message: 'Nome deve ser uma string' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  nome!: string;

  /**
   * Slug único do tenant (para URLs/subdomínios)
   */
  @IsString({ message: 'Slug deve ser uma string' })
  @MaxLength(255, { message: 'Slug deve ter no máximo 255 caracteres' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug deve conter apenas letras minúsculas, números e hífens',
  })
  @IsUnique('Tenant', 'slug', undefined, { message: 'Slug já cadastrado' })
  slug!: string;

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

  /**
   * ID da consultoria (apenas para GOD, CONSULTOR usa a sua consultoria)
   */
  @IsInt({ message: 'ID da consultoria deve ser um número inteiro' })
  @ValidateIf((o) => o.consultoriaId !== undefined)
  @IsExists('Consultoria', 'id', { message: 'Consultoria não encontrada' })
  @IsOptional()
  consultoriaId?: number;
}
