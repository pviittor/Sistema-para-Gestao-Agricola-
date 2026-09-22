/**
 * TEMPLATE: Create DTO
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
  IsNotEmpty,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
// TODO: Importar validadores customizados se necessário
// import { IsExists } from '../../validators/IsExists';
// import { IsUnique } from '../../validators/IsUnique';

/**
 * Create{{EntityName}}Dto - DTO para criação de {{entityName}}
 * 
 * DTO usado no endpoint de criação de {{entityName}} com todas as validações necessárias.
 */
export class Create{{EntityName}}Dto extends CreateDto {
  // TODO: Adicionar campos baseados na especificação
  // Exemplo para campo STRING obrigatório:
  // @IsString({ message: 'Nome deve ser uma string' })
  // @IsNotEmpty({ message: 'Nome é obrigatório' })
  // @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  // @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  // nome!: string;
  
  // Exemplo para campo INTEGER opcional:
  // @IsInt({ message: 'Campo deve ser um número inteiro' })
  // @IsOptional()
  // campoId?: number;
  
  // Exemplo para campo BOOLEAN:
  // @IsBoolean({ message: 'Ativo deve ser um valor booleano' })
  // @IsOptional()
  // ativo?: boolean;
}
