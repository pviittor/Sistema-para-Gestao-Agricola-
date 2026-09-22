/**
 * IsUnique - Validador customizado para campos únicos
 * 
 * Valida se um valor é único em uma tabela do banco de dados.
 * 
 * @example
 * ```typescript
 * import { IsUnique } from '../validators/IsUnique';
 * 
 * export class CreateUsuarioDto {
 *   @IsUnique('Usuario', 'email', { message: 'Email já está em uso' })
 *   email: string;
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
import { Sequelize, Op } from 'sequelize';
import sequelize from '../../config/database';

/**
 * Constraint para validação de unicidade
 */
@ValidatorConstraint({ async: true })
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    if (!value) {
      return true; // Se o valor estiver vazio, deixar outras validações tratarem
    }

    const [modelName, columnName, excludeId] = args.constraints;

    try {
      // Obter o modelo Sequelize pelo nome
      const Model = sequelize.models[modelName];
      
      if (!Model) {
        console.warn(`Modelo ${modelName} não encontrado`);
        return false;
      }

      // Construir condição de busca
      const where: any = {
        [columnName]: value,
      };

      // Se excludeId for fornecido (útil para updates), excluir o registro atual
      // excludeId pode ser 'id' (string) para indicar que deve pegar do objeto
      // ou um número direto para excluir
      if (excludeId !== undefined && excludeId !== null) {
        const object = args.object as any;
        let idValue: any = null;
        
        if (excludeId === 'id') {
          // Tentar pegar do objeto (pode vir de req.params.id em updates via _updateId)
          idValue = object._updateId || object.id || object._id;
        } else if (typeof excludeId === 'number' || typeof excludeId === 'string') {
          idValue = excludeId;
        }
        
        if (idValue) {
          where.id = { [Op.ne]: idValue };
        }
      }

      // Verificar se existe registro com esse valor
      const existing = await Model.findOne({ where });

      // Retornar true se não existir (valor é único)
      return !existing;
    } catch (error) {
      console.error('Erro ao validar unicidade:', error);
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const [modelName, columnName] = args.constraints;
    return `${columnName} já está em uso`;
  }
}

/**
 * Decorator para validar se um campo é único no banco de dados
 * 
 * @param modelName - Nome do modelo Sequelize (ex: 'Usuario')
 * @param columnName - Nome da coluna a validar (ex: 'email')
 * @param excludeId - Campo ou valor para excluir da validação (útil para updates)
 * @param validationOptions - Opções de validação do class-validator
 * 
 * @example
 * ```typescript
 * // Para criação
 * @IsUnique('Usuario', 'email', undefined, { message: 'Email já está em uso' })
 * email: string;
 * 
 * // Para atualização (excluir o próprio registro)
 * @IsUnique('Usuario', 'email', 'id', { message: 'Email já está em uso' })
 * email: string;
 * ```
 */
export function IsUnique(
  modelName: string,
  columnName: string,
  excludeId?: string | number,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      constraints: [modelName, columnName, excludeId],
      options: validationOptions,
      validator: IsUniqueConstraint,
    });
  };
}
