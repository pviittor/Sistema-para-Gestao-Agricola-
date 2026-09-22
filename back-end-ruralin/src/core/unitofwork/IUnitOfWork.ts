/**
 * IUnitOfWork - Interface para Unit of Work Service
 * 
 * Unit of Work é um padrão que garante atomicidade de operações,
 * gerenciando transações de banco de dados automaticamente.
 * 
 * Cada método de Application Service pode ser uma unidade de trabalho,
 * garantindo que todas as operações sejam commitadas ou revertidas juntas.
 * 
 * @example
 * ```typescript
 * import { IUnitOfWork } from './IUnitOfWork';
 * 
 * @Injectable()
 * class UsuarioApplicationService {
 *   constructor(
 *     @Inject(TYPES.IUnitOfWork)
 *     private unitOfWork: IUnitOfWork
 *   ) {}
 * 
 *   async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
 *     return await this.unitOfWork.execute(async (transaction) => {
 *       // Todas as operações dentro desta função serão transacionais
 *       const usuario = await this.repository.create(dto, { transaction });
 *       // Se qualquer operação falhar, todas serão revertidas
 *       return this.mapper.toDto(usuario);
 *     });
 *   }
 * }
 * ```
 */

import { Transaction } from 'sequelize';

/**
 * Interface para Unit of Work Service
 * 
 * Define o contrato para gerenciamento de transações de banco de dados.
 * O método `execute` garante que todas as operações dentro da função
 * sejam executadas em uma única transação, com commit automático em sucesso
 * ou rollback automático em caso de erro.
 */
export interface IUnitOfWork {
  /**
   * Executa uma função dentro de uma transação de banco de dados
   * 
   * Cria uma transação, executa a função fornecida, e automaticamente:
   * - Faz commit se a função executar com sucesso
   * - Faz rollback se a função lançar uma exceção
   * 
   * @template T - Tipo de retorno da função
   * @param fn - Função a ser executada dentro da transação
   * @returns Promise que resolve com o resultado da função
   * 
   * @example
   * ```typescript
   * const result = await unitOfWork.execute(async (transaction) => {
   *   const usuario = await usuarioRepository.create(dto, { transaction });
   *   const role = await roleRepository.create(roleDto, { transaction });
   *   await usuarioRoleRepository.create({ usuarioId: usuario.id, roleId: role.id }, { transaction });
   *   return usuario;
   * });
   * // Se qualquer operação falhar, todas serão revertidas
   * ```
   */
  execute<T>(fn: (transaction: Transaction) => Promise<T>): Promise<T>;
}
