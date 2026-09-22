/**
 * IPessoaApplicationService - Interface para Application Service de Pessoa
 * 
 * Esta interface estende IApplicationService e adiciona métodos específicos
 * para busca de pessoas por CPF/CNPJ, email, tipo, papel e usuário criador.
 * 
 * @example
 * ```typescript
 * import { IPessoaApplicationService } from './IPessoaApplicationService';
 * 
 * @Injectable()
 * class PessoaController {
 *   constructor(
 *     @Inject(TYPES.IPessoaApplicationService)
 *     private pessoaService: IPessoaApplicationService
 *   ) {}
 * 
 *   async getByCpfCnpj(req: Request, res: Response) {
 *     const { cpfcnpj } = req.params;
 *     const pessoa = await this.pessoaService.findByCpfCnpj(cpfcnpj);
 *     return res.json(pessoa);
 *   }
 * }
 * ```
 */

import { IApplicationService } from '../IApplicationService';
import { CreatePessoaDto } from '../../dto/pessoa/CreatePessoaDto';
import { UpdatePessoaDto } from '../../dto/pessoa/UpdatePessoaDto';
import { PessoaResponseDto } from '../../dto/pessoa/PessoaResponseDto';

/**
 * Interface para Application Service de Pessoa
 * 
 * Define métodos padrão CRUD e métodos customizados específicos para pessoas.
 */
export interface IPessoaApplicationService 
  extends IApplicationService<PessoaResponseDto, CreatePessoaDto, UpdatePessoaDto> {
  /**
   * Busca pessoa por CPF ou CNPJ
   * 
   * @param cpfcnpj - CPF ou CNPJ da pessoa (com ou sem formatação)
   * @returns Promise que resolve com o DTO da pessoa encontrada ou null
   * 
   * @example
   * ```typescript
   * const pessoa = await pessoaService.findByCpfCnpj('12345678901');
   * if (pessoa) {
   *   console.log(`Pessoa encontrada: ${pessoa.nomerazao_pessoa}`);
   * }
   * ```
   */
  findByCpfCnpj(cpfcnpj: string): Promise<PessoaResponseDto | null>;

  /**
   * Busca pessoa por email
   * 
   * @param email - Email da pessoa
   * @returns Promise que resolve com o DTO da pessoa encontrada ou null
   * 
   * @example
   * ```typescript
   * const pessoa = await pessoaService.findByEmail('pessoa@example.com');
   * ```
   */
  findByEmail(email: string): Promise<PessoaResponseDto | null>;

  /**
   * Busca pessoas por tipo (Pessoa Física ou Pessoa Jurídica)
   * 
   * @param tipo - Tipo de pessoa: 1 = Pessoa Física (PF), 2 = Pessoa Jurídica (PJ)
   * @returns Promise que resolve com array de DTOs de pessoas do tipo especificado
   * 
   * @example
   * ```typescript
   * const pessoasFisicas = await pessoaService.findByTipo(1);
   * ```
   */
  findByTipo(tipo: number): Promise<PessoaResponseDto[]>;

  /**
   * Busca pessoas criadas por um usuário específico
   * 
   * @param userId - ID do usuário que criou as pessoas
   * @returns Promise que resolve com array de DTOs de pessoas criadas pelo usuário
   * 
   * @example
   * ```typescript
   * const pessoas = await pessoaService.findByUserCreation(1);
   * ```
   */
  findByUserCreation(userId: number): Promise<PessoaResponseDto[]>;

  /**
   * Busca pessoas por papel específico
   * 
   * @param papel - Papel da pessoa: 'cliente', 'produtor', 'portador', 'funcionario', 'fornecedor', 'motorista', 'operador'
   * @returns Promise que resolve com array de DTOs de pessoas com o papel especificado
   * 
   * @example
   * ```typescript
   * const clientes = await pessoaService.findByPapel('cliente');
   * ```
   */
  findByPapel(papel: string): Promise<PessoaResponseDto[]>;
}
