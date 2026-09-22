/**
 * IsValidEnum - Validador customizado para validar valores de enum
 * 
 * Valida se um valor pertence a um enum específico, com mensagens de erro personalizadas
 * e suporte para valores opcionais.
 * 
 * @example
 * ```typescript
 * import { IsValidEnum } from '../validators/IsValidEnum';
 * 
 * enum UsuarioTipo {
 *   ROOT = 'ROOT',
 *   CLIENT = 'CLIENT'
 * }
 * 
 * export class CreateUsuarioDto {
 *   @IsValidEnum(UsuarioTipo, { message: 'Tipo deve ser ROOT ou CLIENT' })
 *   tipo: UsuarioTipo;
 * }
 * ```
 */

import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Constraint para validação de enum
 */
@ValidatorConstraint({ async: false })
export class IsValidEnumConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    if (value === undefined || value === null) {
      return true; // Deixar @IsNotEmpty ou @IsOptional tratarem valores vazios
    }

    const [enumObject] = args.constraints;

    // Verificar se enumObject é um objeto válido
    if (!enumObject || typeof enumObject !== 'object') {
      console.warn('IsValidEnum: enumObject inválido fornecido');
      return false;
    }

    // Obter valores do enum
    const enumValues = Object.values(enumObject);

    // Verificar se o valor está nos valores do enum
    return enumValues.includes(value);
  }

  defaultMessage(args: ValidationArguments): string {
    const [enumObject] = args.constraints;
    
    if (!enumObject || typeof enumObject !== 'object') {
      return 'Valor inválido para enum';
    }

    const enumValues = Object.values(enumObject);
    const enumKeys = Object.keys(enumObject).filter(key => isNaN(Number(key)));
    
    // Se o enum tem chaves nomeadas, mostrar chaves, senão mostrar valores
    const displayValues = enumKeys.length > 0 ? enumKeys.join(', ') : enumValues.join(', ');
    
    return `Valor deve ser um dos seguintes: ${displayValues}`;
  }
}

/**
 * Decorator para validar se um valor pertence a um enum
 * 
 * @param enumObject - Objeto enum a validar (ex: UsuarioTipo)
 * @param validationOptions - Opções de validação do class-validator
 * 
 * @example
 * ```typescript
 * enum Status {
 *   ACTIVE = 'ACTIVE',
 *   INACTIVE = 'INACTIVE',
 *   PENDING = 'PENDING'
 * }
 * 
 * export class CreateEntityDto {
 *   @IsValidEnum(Status, { message: 'Status deve ser ACTIVE, INACTIVE ou PENDING' })
 *   status: Status;
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Com enum numérico
 * enum Priority {
 *   LOW = 1,
 *   MEDIUM = 2,
 *   HIGH = 3
 * }
 * 
 * export class CreateTaskDto {
 *   @IsValidEnum(Priority, { message: 'Prioridade deve ser 1 (LOW), 2 (MEDIUM) ou 3 (HIGH)' })
 *   priority: Priority;
 * }
 * ```
 */
export function IsValidEnum(
  enumObject: object,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      constraints: [enumObject],
      options: validationOptions,
      validator: IsValidEnumConstraint,
    });
  };
}
