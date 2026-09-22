/**
 * IsExists - Validador customizado para verificar existência de registro
 * 
 * Valida se um valor (geralmente um ID) existe em uma tabela do banco de dados.
 * 
 * @example
 * ```typescript
 * import { IsExists } from '../validators/IsExists';
 * 
 * export class CreateEventoDto {
 *   @IsExists('Local', 'id', { message: 'Local não encontrado' })
 *   localId: number;
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
import sequelize from '../../config/database';

/**
 * Constraint para validação de existência
 */
@ValidatorConstraint({ async: true })
export class IsExistsConstraint implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    if (!value) {
      return true; // Se o valor estiver vazio, deixar outras validações tratarem
    }

    const [modelName, columnName] = args.constraints;

    try {
      // Obter o modelo Sequelize pelo nome
      const Model = sequelize.models[modelName];
      
      if (!Model) {
        console.warn(`Modelo ${modelName} não encontrado`);
        return false;
      }

      // Verificar se existe registro com esse valor
      const existing = await Model.findOne({
        where: {
          [columnName]: value,
        },
      });

      // Retornar true se existir
      return !!existing;
    } catch (error) {
      console.error('Erro ao validar existência:', error);
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const [modelName, columnName] = args.constraints;
    return `${modelName} com ${columnName} fornecido não encontrado`;
  }
}

/**
 * Decorator para validar se um valor existe no banco de dados
 * 
 * @param modelName - Nome do modelo Sequelize (ex: 'Local', 'Usuario')
 * @param columnName - Nome da coluna a validar (ex: 'id')
 * @param validationOptions - Opções de validação do class-validator
 * 
 * @example
 * ```typescript
 * @IsExists('Local', 'id', { message: 'Local não encontrado' })
 * localId: number;
 * ```
 */
export function IsExists(
  modelName: string,
  columnName: string,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      constraints: [modelName, columnName],
      options: validationOptions,
      validator: IsExistsConstraint,
    });
  };
}
