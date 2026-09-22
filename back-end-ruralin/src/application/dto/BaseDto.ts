/**
 * BaseDto - Classe base para todos os DTOs
 * 
 * Esta classe serve como base para todos os DTOs do sistema.
 * DTOs devem estender esta classe para garantir consistência.
 * 
 * @example
 * ```typescript
 * import { IsString, IsNotEmpty } from 'class-validator';
 * 
 * export class CreateUsuarioDto extends BaseDto {
 *   @IsString()
 *   @IsNotEmpty()
 *   nome: string;
 * }
 * ```
 */

export abstract class BaseDto {}
