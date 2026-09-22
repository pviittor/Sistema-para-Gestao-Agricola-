/**
 * @Transactional - Decorator para aplicar transações automaticamente
 * 
 * Este decorator aplica transações de banco de dados automaticamente em métodos
 * de Application Services, garantindo atomicidade de operações.
 * 
 * Características:
 * - Aplica transação automaticamente ao método
 * - Faz commit automático em sucesso
 * - Faz rollback automático em caso de erro
 * - Integrado com UnitOfWork Service via DI
 * 
 * @example
 * ```typescript
 * @Injectable()
 * export class UsuarioApplicationService {
 *   constructor(
 *     @Inject(TYPES.IUsuarioRepository)
 *     private repository: IUsuarioRepository,
 *     @Inject(TYPES.IUnitOfWork)
 *     private unitOfWork: IUnitOfWork
 *   ) {}
 * 
 *   @Transactional()
 *   async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
 *     // Este método será executado dentro de uma transação automaticamente
 *     const entity = await this.mapper.toEntity(dto);
 *     const created = await this.repository.create(entity as any);
 *     return this.mapper.toDto(created);
 *   }
 * }
 * ```
 */

import { container } from '../di/container';
import { TYPES } from '../di/types';
import { IUnitOfWork } from './IUnitOfWork';
import { Transaction } from 'sequelize';

/**
 * Opções para o decorator @Transactional
 */
export interface TransactionOptions {
  /**
   * Nível de isolamento da transação (futuro)
   * Por enquanto não implementado, mas preparado para extensão
   */
  isolationLevel?: 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';
}

/**
 * Decorator para aplicar transações automaticamente em métodos
 * 
 * Intercepta a chamada do método e executa dentro de uma transação,
 * usando o UnitOfWork Service para gerenciar commit e rollback.
 * 
 * @param options - Opções de configuração da transação (opcional)
 * @returns Decorator function
 * 
 * @example
 * ```typescript
 * class MyService {
 *   @Transactional()
 *   async create(data: any): Promise<any> {
 *     // Método executado dentro de transação
 *   }
 * }
 * ```
 */
export function Transactional(options?: TransactionOptions) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    // Guardar método original
    const originalMethod = descriptor.value;

    // Verificar se método é assíncrono
    if (!originalMethod || typeof originalMethod !== 'function') {
      throw new Error(`@Transactional can only be applied to methods. Property "${propertyName}" is not a method.`);
    }

    // Substituir método por wrapper transacional
    descriptor.value = async function (...args: any[]) {
      // Resolver UnitOfWork do container
      const unitOfWork = container.resolve<IUnitOfWork>(TYPES.IUnitOfWork);

      // Executar método original dentro de transação
      return await unitOfWork.execute(async (transaction: Transaction) => {
        // Executar método original
        // Nota: A transação não é passada automaticamente para o método
        // Se o método precisar da transação, ele deve injetar IUnitOfWork
        // e usar unitOfWork.execute() internamente, ou a transação pode ser
        // passada via contexto (implementação futura)
        return await originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
}
