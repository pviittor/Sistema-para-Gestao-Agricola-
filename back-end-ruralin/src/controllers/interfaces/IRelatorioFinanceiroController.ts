import { Request, Response } from 'express';

/**
 * Interface para Controller de Relatório Financeiro
 * 
 * Define os métodos HTTP disponíveis para operações de relatórios financeiros,
 * especialmente o relatório de Planejado vs Realizado.
 */
export interface IRelatorioFinanceiroController {
  /**
   * Calcula e retorna relatório de Planejado vs Realizado
   * GET /api/relatorios/planejado-realizado?dataInicio=2024-01-01&dataFim=2024-12-31&...
   */
  planejadoRealizado(req: Request, res: Response): Promise<void>;

  /**
   * Exporta relatório de Planejado vs Realizado (opcional)
   * GET /api/relatorios/planejado-realizado/exportar?dataInicio=2024-01-01&dataFim=2024-12-31&...
   */
  exportarRelatorio(req: Request, res: Response): Promise<void>;
}
