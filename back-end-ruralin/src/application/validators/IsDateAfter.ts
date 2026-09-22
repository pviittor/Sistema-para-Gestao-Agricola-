/**
 * IsDateAfter - Validador customizado para validar que uma data é posterior ou igual a outra
 * 
 * Valida que uma data é posterior ou igual a outra data.
 * 
 * @example
 * ```typescript
 * import { IsDateAfter } from '../validators/IsDateAfter';
 * 
 * export class CreateFinanceiroDto {
 *   @IsDateAfter('dataEmissao', { message: 'Data de vencimento deve ser posterior ou igual à data de emissão' })
 *   dataVencimento: string;
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
 * Constraint para validação de data posterior
 */
@ValidatorConstraint({ async: false })
export class IsDateAfterConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    if (!value) {
      return true; // Se o valor estiver vazio, deixar outras validações tratarem
    }

    const [compareDateProperty, allowEqual = true] = args.constraints;
    const object = args.object as any;

    const dateValue = value;
    const compareDate = object[compareDateProperty];

    // Se a data de comparação não foi fornecida, não podemos validar
    if (!compareDate) {
      return true; // Deixar outras validações tratarem
    }

    try {
      const dateValueObj = new Date(dateValue);
      const compareDateObj = new Date(compareDate);

      // Validar se as datas são válidas
      if (isNaN(dateValueObj.getTime()) || isNaN(compareDateObj.getTime())) {
        return false;
      }

      // Normalizar para comparar apenas datas (sem hora)
      dateValueObj.setHours(0, 0, 0, 0);
      compareDateObj.setHours(0, 0, 0, 0);

      // Se allowEqual é true, permite datas iguais
      if (allowEqual) {
        return dateValueObj >= compareDateObj;
      }

      return dateValueObj > compareDateObj;
    } catch (error) {
      console.error('Erro ao validar data:', error);
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const [compareDateProperty, allowEqual] = args.constraints;
    const message = allowEqual
      ? `Data deve ser posterior ou igual a ${compareDateProperty}`
      : `Data deve ser posterior a ${compareDateProperty}`;
    return message;
  }
}

/**
 * Decorator para validar que uma data é posterior ou igual a outra
 * 
 * @param compareDateProperty - Nome da propriedade que contém a data de comparação
 * @param allowEqual - Se true, permite datas iguais (padrão: true)
 * @param validationOptions - Opções de validação do class-validator
 * 
 * @example
 * ```typescript
 * // Permite datas iguais (padrão)
 * @IsDateAfter('dataEmissao', true, { message: 'Data de vencimento deve ser posterior ou igual à data de emissão' })
 * dataVencimento: string;
 * 
 * // Não permite datas iguais
 * @IsDateAfter('dataInicio', false, { message: 'Data de fim deve ser posterior à data de início' })
 * dataFim: string;
 * ```
 */
export function IsDateAfter(
  compareDateProperty: string,
  allowEqual: boolean = true,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      constraints: [compareDateProperty, allowEqual],
      options: validationOptions,
      validator: IsDateAfterConstraint,
    });
  };
}
