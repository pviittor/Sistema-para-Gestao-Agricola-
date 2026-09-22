/**
 * Barrel export para todas as exceções customizadas
 * 
 * Importe todas as exceções de um único lugar:
 * ```typescript
 * import { BusinessException, NotFoundException } from '../core/exceptions';
 * ```
 */

export { BaseException } from './BaseException';
export { BusinessException } from './BusinessException';
export { ValidationException } from './ValidationException';
export { NotFoundException } from './NotFoundException';
export { UnauthorizedException } from './UnauthorizedException';
export { ForbiddenException } from './ForbiddenException';
export { BadRequestException } from './BadRequestException';