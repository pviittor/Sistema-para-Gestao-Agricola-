/**
 * TEMPLATE: Update DTO
 * 
 * Variáveis de substituição:
 * - {{EntityName}}: Nome da entidade em PascalCase
 */

import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
  Matches,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
// TODO: Importar validadores customizados se necessário
// import { IsExists } from '../../validators/IsExists';
// import { IsUnique } from '../../validators/IsUnique';

/**
 * Update{{EntityName}}Dto - DTO para atualização de {{entityName}}
 * 
 * DTO usado no endpoint de atualização de {{entityName}}.
 * Todos os campos são opcionais.
 */
export class Update{{EntityName}}Dto extends UpdateDto {
  // TODO: Adicionar campos baseados na especificação (todos opcionais)
  // Exemplo:
  // @IsString({ message: 'Nome deve ser uma string' })
  // @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  // @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  // @IsOptional()
  // nome?: string;
}
