/**
 * IFinanceiroApplicationService - Interface para Application Service de Financeiro
 * 
 * Esta interface estende IApplicationService e adiciona métodos específicos
 * para busca de registros financeiros por período e por tipo.
 * 
 * @example
 * ```typescript
 * import { IFinanceiroApplicationService } from './IFinanceiroApplicationService';
 * 
 * @Injectable()
 * class FinanceiroController {
 *   constructor(
 *     @Inject(TYPES.IFinanceiroApplicationService)
 *     private financeiroService: IFinanceiroApplicationService
 *   ) {}
 * 
 *   async getByPeriodo(req: Request, res: Response) {
 *     const { dataInicio, dataFim } = req.query;
 *     const registros = await this.financeiroService.findByPeriodo(dataInicio, dataFim);
 *     return res.json(registros);
 *   }
 * }
 * ```
 */

import { IApplicationService } from '../IApplicationService';
import { CreateFinanceiroDto } from '../../dto/financeiro/CreateFinanceiroDto';
import { UpdateFinanceiroDto } from '../../dto/financeiro/UpdateFinanceiroDto';
import { FinanceiroResponseDto } from '../../dto/financeiro/FinanceiroResponseDto';

/**
 * Interface para Application Service de Financeiro
 * 
 * Define métodos padrão CRUD e métodos customizados específicos para registros financeiros.
 */
export interface IFinanceiroApplicationService 
  extends IApplicationService<FinanceiroResponseDto, CreateFinanceiroDto, UpdateFinanceiroDto> {
  /**
   * Busca registros financeiros por período de datas
   * 
   * @param dataInicio - Data de início do período (inclusive)
   * @param dataFim - Data de fim do período (inclusive)
   * @returns Promise que resolve com array de DTOs de registros financeiros no período
   * 
   * @example
   * ```typescript
   * const registros = await financeiroService.findByPeriodo('2025-01-01', '2025-01-31');
   * console.log(`Encontrados ${registros.length} registros no período`);
   * ```
   */
  findByPeriodo(dataInicio: Date | string, dataFim: Date | string): Promise<FinanceiroResponseDto[]>;

  /**
   * Busca registros financeiros por tipo
   * 
   * @param tipo - Tipo do registro financeiro ('RECEITA' ou 'DESPESA')
   * @returns Promise que resolve com array de DTOs de registros financeiros do tipo
   * 
   * @example
   * ```typescript
   * const receitas = await financeiroService.findByTipo('RECEITA');
   * console.log(`Encontradas ${receitas.length} receitas`);
   * ```
   */
  findByTipo(tipo: 'RECEITA' | 'DESPESA'): Promise<FinanceiroResponseDto[]>;
}
