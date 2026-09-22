/**
 * UpdateDto - Classe base para DTOs de atualização
 * 
 * Use esta classe como base para DTOs que representam dados
 * para atualização de recursos. Todos os campos são opcionais
 * por padrão, permitindo atualizações parciais.
 * 
 * @example
 * ```typescript
 * import { IsString, IsOptional } from 'class-validator';
 * 
 * export class UpdateUsuarioDto extends UpdateDto {
 *   @IsString()
 *   @IsOptional()
 *   nome?: string;
 * }
 * ```
 */

import { BaseDto } from './BaseDto';

export abstract class UpdateDto extends BaseDto {
  /**
   * Todos os campos em UpdateDto são opcionais por padrão,
   * permitindo atualizações parciais de recursos.
   */
}
