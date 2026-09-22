import { IRepository } from '../../core/repository/IRepository';
import OutraDespesaReceita from '../../models/OutraDespesaReceita';

/**
 * Interface para repositório de OutraDespesaReceita
 */
export interface IOutraDespesaReceitaRepository extends IRepository<OutraDespesaReceita> {
  /**
   * Busca outras despesas/receitas por filtros dinâmicos
   *
   * @param tenantId - ID do tenant
   * @param planoGerencialId - ID do plano gerencial (opcional)
   * @param dataInicio - Data de início do período (opcional)
   * @param dataFim - Data de fim do período (opcional)
   * @param configuradorCicloId - ID do configurador de ciclo (opcional)
   * @param cultura - Nome ou ID da cultura para filtrar via ConfiguradorCiclo (opcional)
   * @returns Lista de OutraDespesaReceita que atendem aos filtros
   */
  findByFilters(
    tenantId: number,
    planoGerencialId?: number,
    dataInicio?: string,
    dataFim?: string,
    configuradorCicloId?: number,
    cultura?: string
  ): Promise<OutraDespesaReceita[]>;

  /**
   * Busca outras despesas/receitas vinculadas a uma cultura específica
   * (via ConfiguradorCiclo)
   *
   * @param tenantId - ID do tenant
   * @param cultura - Nome ou ID da cultura
   * @returns Lista de OutraDespesaReceita vinculadas à cultura
   */
  findByCultura(tenantId: number, cultura: string): Promise<OutraDespesaReceita[]>;
}
