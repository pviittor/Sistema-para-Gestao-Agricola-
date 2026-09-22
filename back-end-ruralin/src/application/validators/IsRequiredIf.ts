/**
 * IsRequiredIf - Validador customizado para validação condicional
 * 
 * Valida que um campo é obrigatório se outro campo tiver um valor específico.
 * Útil para validações cross-field complexas.
 * 
 * @example
 * ```typescript
 * import { IsRequiredIf } from '../validators/IsRequiredIf';
 * 
 * export class CreateFinanceiroDto {
 *   tipo: 'RECEITA' | 'DESPESA';
 * 
 *   @IsRequiredIf('tipo', 'DESPESA', { message: 'Categoria é obrigatória para despesas' })
 *   categoriaId?: number;
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
 * Constraint para validação condicional
 */
@ValidatorConstraint({ async: false })
export class IsRequiredIfConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const [conditionProperty, conditionValue] = args.constraints;
    const object = args.object as any;

    // Obter valor da propriedade de condição
    const conditionPropertyValue = object[conditionProperty];

    // Se a condição não for atendida, o campo não é obrigatório
    if (conditionPropertyValue !== conditionValue) {
      return true;
    }

    // Se a condição for atendida, o campo é obrigatório
    return value !== undefined && value !== null && value !== '';
  }

  defaultMessage(args: ValidationArguments): string {
    const [conditionProperty, conditionValue] = args.constraints;
    return `${args.property} é obrigatório quando ${conditionProperty} é ${conditionValue}`;
  }
}

/**
 * Decorator para validar que um campo é obrigatório se outro campo tiver um valor específico
 * 
 * @param conditionProperty - Nome da propriedade que deve ser verificada
 * @param conditionValue - Valor que a propriedade deve ter para tornar o campo obrigatório
 * @param validationOptions - Opções de validação do class-validator
 * 
 * @example
 * ```typescript
 * // Campo obrigatório apenas se tipo for 'DESPESA'
 * @IsRequiredIf('tipo', 'DESPESA', { message: 'Categoria é obrigatória para despesas' })
 * categoriaId?: number;
 * 
 * // Campo obrigatório apenas se status for 'ACTIVE'
 * @IsRequiredIf('status', 'ACTIVE', { message: 'Data de ativação é obrigatória quando status é ACTIVE' })
 * dataAtivacao?: string;
 * ```
 */
export function IsRequiredIf(
  conditionProperty: string,
  conditionValue: any,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      constraints: [conditionProperty, conditionValue],
      options: validationOptions,
      validator: IsRequiredIfConstraint,
    });
  };
}
