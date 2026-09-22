/**
 * CreateDto - Classe base para DTOs de criação
 * 
 * Use esta classe como base para DTOs que representam dados
 * para criação de recursos.
 * 
 * @example
 * ```typescript
 * import { IsString, IsEmail } from 'class-validator';
 * 
 * export class CreateUsuarioDto extends CreateDto {
 *   @IsString()
 *   @IsNotEmpty()
 *   nome: string;
 *   
 *   @IsEmail()
 *   email: string;
 * }
 * ```
 */

import { BaseDto } from './BaseDto';

export abstract class CreateDto extends BaseDto {}
