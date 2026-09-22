/**
 * FinanceiroRepository - Repositório para entidade Financeiro
 * 
 * Implementa IFinanceiroRepository estendendo BaseRepository e adiciona
 * métodos específicos para busca de registros financeiros por período e por tipo.
 * 
 * @example
 * ```typescript
 * import { FinanceiroRepository } from './FinanceiroRepository';
 * 
 * const repository = new FinanceiroRepository();
 * const registros = await repository.findByPeriodo(
 *   new Date('2025-01-01'),
 *   new Date('2025-01-31')
 * );
 * ```
 */

import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IFinanceiroRepository } from './IFinanceiroRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import Financeiro from '../../models/Financeiro';
import { Op } from 'sequelize';

/**
 * Repositório para entidade Financeiro
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca por período e por tipo.
 */
@Injectable()
export class FinanceiroRepository extends BaseRepository<Financeiro> implements IFinanceiroRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo Financeiro, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Financeiro, cacheService, tenantService);
  }

  /**
   * Busca registros financeiros por período de datas
   * 
   * Busca registros onde a data de emissão ou vencimento está no período especificado.
   * 
   * @param dataInicio - Data de início do período (inclusive)
   * @param dataFim - Data de fim do período (inclusive)
   * @returns Promise que resolve com array de registros financeiros no período
   */
  async findByPeriodo(dataInicio: Date | string, dataFim: Date | string): Promise<Financeiro[]> {
    // Converter para string no formato YYYY-MM-DD se necessário
    const dataInicioStr = dataInicio instanceof Date 
      ? dataInicio.toISOString().split('T')[0]
      : dataInicio;
    const dataFimStr = dataFim instanceof Date
      ? dataFim.toISOString().split('T')[0]
      : dataFim;

    return await this.findAll({
      where: {
        [Op.or]: [
          {
            dataEmissao: {
              [Op.between]: [dataInicioStr, dataFimStr],
            },
          },
          {
            dataVencimento: {
              [Op.between]: [dataInicioStr, dataFimStr],
            },
          },
        ],
      },
      order: [['dataEmissao', 'ASC'], ['dataVencimento', 'ASC']],
    });
  }

  /**
   * Busca registros financeiros por tipo
   * 
   * O tipo é determinado pelo sinal do valor:
   * - Valores positivos: RECEITA
   * - Valores negativos: DESPESA   
   * 
   * @param tipo - Tipo do registro financeiro ('RECEITA' ou 'DESPESA')
   * @returns Promise que resolve com array de registros financeiros do tipo
   */
  async findByTipo(tipo: string): Promise<Financeiro[]> {
    const tipoUpper = tipo.toUpperCase();
    
    // Determinar operador baseado no tipo
    // RECEITA: valor >= 0
    // DESPESA: valor < 0
    const whereCondition = tipoUpper === 'RECEITA'
      ? { valor: { [Op.gte]: 0 } }
      : { valor: { [Op.lt]: 0 } };

    return await this.findAll({
        where: whereCondition,
      order: [['dataEmissao', 'DESC']],
    });
  }
}
