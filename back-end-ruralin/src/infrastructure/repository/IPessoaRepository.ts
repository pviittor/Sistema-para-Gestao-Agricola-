/**
 * IPessoaRepository - Interface para repositório de Pessoa
 * 
 * Esta interface estende IRepository<Pessoa> e adiciona métodos específicos
 * para busca de pessoas por CPF/CNPJ, email, tipo e papel.
 * 
 * @example
 * ```typescript
 * import { IPessoaRepository } from './IPessoaRepository';
 * 
 * @Injectable()
 * class PessoaApplicationService {
 *   constructor(
 *     @Inject(TYPES.IPessoaRepository)
 *     private repository: IPessoaRepository
 *   ) {}
 * 
 *   async getByCpfCnpj(cpfcnpj: string) {
 *     return await this.repository.findByCpfCnpj(cpfcnpj);
 *   }
 * }
 * ```
 */

import { IRepository } from '../../core/repository/IRepository';
import Pessoa from '../../models/Pessoa';

/**
 * Interface para repositório de Pessoa
 * 
 * Define métodos específicos para busca de pessoas além dos métodos
 * padrão da interface IRepository.
 */
export interface IPessoaRepository extends IRepository<Pessoa> {
  /**
   * Busca pessoa por CPF ou CNPJ
   * 
   * @param cpfcnpj - CPF ou CNPJ da pessoa (com ou sem formatação)
   * @returns Promise que resolve com a pessoa encontrada ou null
   * 
   * @example
   * ```typescript
   * const pessoa = await pessoaRepository.findByCpfCnpj('12345678901');
   * if (pessoa) {
   *   console.log(`Pessoa encontrada: ${pessoa.nomerazao_pessoa}`);
   * }
   * ```
   */
  findByCpfCnpj(cpfcnpj: string): Promise<Pessoa | null>;

  /**
   * Busca pessoa por email
   * 
   * @param email - Email da pessoa
   * @returns Promise que resolve com a pessoa encontrada ou null
   * 
   * @example
   * ```typescript
   * const pessoa = await pessoaRepository.findByEmail('pessoa@example.com');
   * ```
   */
  findByEmail(email: string): Promise<Pessoa | null>;

  /**
   * Busca pessoas por tipo (Pessoa Física ou Pessoa Jurídica)
   * 
   * @param tipo - Tipo de pessoa: 1 = Pessoa Física (PF), 2 = Pessoa Jurídica (PJ)
   * @returns Promise que resolve com array de pessoas do tipo especificado
   * 
   * @example
   * ```typescript
   * const pessoasFisicas = await pessoaRepository.findByTipo(1);
   * ```
   */
  findByTipo(tipo: number): Promise<Pessoa[]>;

  /**
   * Busca pessoas criadas por um usuário específico
   * 
   * @param userId - ID do usuário que criou as pessoas
   * @returns Promise que resolve com array de pessoas criadas pelo usuário
   * 
   * @example
   * ```typescript
   * const pessoas = await pessoaRepository.findByUserCreation(1);
   * ```
   */
  findByUserCreation(userId: number): Promise<Pessoa[]>;

  /**
   * Busca pessoas por papel específico
   * 
   * @param papel - Papel da pessoa: 'cliente', 'produtor', 'portador', 'funcionario', 'fornecedor', 'motorista', 'operador'
   * @returns Promise que resolve com array de pessoas com o papel especificado
   * 
   * @example
   * ```typescript
   * const clientes = await pessoaRepository.findByPapel('cliente');
   * ```
   */
  findByPapel(papel: string): Promise<Pessoa[]>;
}
