/**
 * IsTimeAfter - Validador customizado para validar que horário de fim é posterior ao início
 * 
 * Valida que o horário de fim é posterior ao horário de início.
 * Se ambos estiverem no mesmo dia, compara apenas os horários.
 * Se estiverem em dias diferentes, considera a data também.
 * 
 * @example
 * ```typescript
 * import { IsTimeAfter } from '../validators/IsTimeAfter';
 * 
 * export class CreateEventoDto {
 *   @IsTimeAfter('horario_inicio', 'data', { message: 'Horário de fim deve ser posterior ao início' })
 *   horario_fim: string;
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
 * Constraint para validação de horário posterior
 */
@ValidatorConstraint({ async: false })
export class IsTimeAfterConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    if (!value) {
      return true; // Se o valor estiver vazio, deixar outras validações tratarem
    }

    const [startTimeProperty, dateProperty] = args.constraints;
    const object = args.object as any;

    const endTime = value;
    const startTime = object[startTimeProperty];
    const date = object[dateProperty];

    // Se horário de início não foi fornecido, não podemos validar
    // Em updates, pode ser que apenas horario_fim seja atualizado
    if (!startTime) {
      return true; // Deixar outras validações tratarem
    }

    try {
      // Se temos data, criar objetos Date completos para comparação
      if (date) {
        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);
        
        // Validar se as datas são válidas
        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
          return false;
        }
        
        // Se a data for no passado, não validar (pode ser evento histórico)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDate = new Date(date);
        eventDate.setHours(0, 0, 0, 0);
        
        // Se evento é no passado, permitir qualquer horário
        if (eventDate < today) {
          return true;
        }
        
        return endDateTime > startDateTime;
      }

      // Se não temos data, comparar apenas os horários
      const startParts = startTime.split(':');
      const endParts = endTime.split(':');
      
      if (startParts.length < 2 || endParts.length < 2) {
        return false;
      }

      const [startHours, startMinutes, startSeconds = 0] = startParts.map(Number);
      const [endHours, endMinutes, endSeconds = 0] = endParts.map(Number);

      const startTotalSeconds = startHours * 3600 + startMinutes * 60 + startSeconds;
      const endTotalSeconds = endHours * 3600 + endMinutes * 60 + endSeconds;

      return endTotalSeconds > startTotalSeconds;
    } catch (error) {
      console.error('Erro ao validar horário:', error);
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Horário de fim deve ser posterior ao horário de início';
  }
}

/**
 * Decorator para validar que um horário é posterior a outro
 * 
 * @param startTimeProperty - Nome da propriedade que contém o horário de início
 * @param dateProperty - Nome da propriedade que contém a data (opcional)
 * @param validationOptions - Opções de validação do class-validator
 * 
 * @example
 * ```typescript
 * @IsTimeAfter('horario_inicio', 'data', { message: 'Horário de fim deve ser posterior ao início' })
 * horario_fim: string;
 * ```
 */
export function IsTimeAfter(
  startTimeProperty: string,
  dateProperty?: string,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      constraints: [startTimeProperty, dateProperty],
      options: validationOptions,
      validator: IsTimeAfterConstraint,
    });
  };
}
