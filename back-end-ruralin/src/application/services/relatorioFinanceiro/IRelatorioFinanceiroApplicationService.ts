import { FiltroPlanejadoRealizadoDto } from '../../dto/relatorio/FiltroPlanejadoRealizadoDto';
import { PlanejadoRealizadoDto } from '../../dto/relatorio/PlanejadoRealizadoDto';

/**
 * Interface para Application Service de Relatórios Financeiros
 * 
 * Define os métodos disponíveis para operações de relatórios financeiros,
 * especialmente o relatório de Planejado vs Realizado.
 */
export interface IRelatorioFinanceiroApplicationService {
  /**
   * Calcula e retorna relatório de Planejado vs Realizado
   * 
   * Agrupa valores por Plano de Contas e Centro de Custo, calculando:
   * - Planejado: Soma dos rateios de títulos com status ABERTO ou PARCIAL
   * - Realizado: Soma dos movimentos financeiros de parcelas baixadas
   * - Diferença: Realizado - Planejado
   * - Percentual de Realização: (Realizado / Planejado) × 100
   * 
   * @param filtros - DTO com filtros do relatório (período, safra, fazenda, etc.)
   * @returns Promise que resolve com array de DTOs agrupados por PC × CC
   */
  calcularPlanejadoRealizado(filtros: FiltroPlanejadoRealizadoDto): Promise<PlanejadoRealizadoDto[]>;
}
