import { Request, Response } from 'express';

/**
 * Interface para Controller de Parcela
 * 
 * Define os métodos HTTP disponíveis para operações de baixa de parcelas e consulta de movimentos financeiros.
 */
export interface IParcelaController {
  /**
   * Baixa uma parcela de título a pagar
   * POST /api/parcelas/tituloPagar/:idParcela/baixar
   */
  baixarParcelaTituloPagar(req: Request, res: Response): Promise<void>;

  /**
   * Baixa uma parcela de título a receber
   * POST /api/parcelas/tituloReceber/:idParcela/baixar
   */
  baixarParcelaTituloReceber(req: Request, res: Response): Promise<void>;

  /**
   * Consulta movimentos financeiros de uma parcela de título a pagar
   * GET /api/parcelas/tituloPagar/:idParcela/movimentos
   */
  consultarMovimentosParcelaTituloPagar(req: Request, res: Response): Promise<void>;

  /**
   * Consulta movimentos financeiros de uma parcela de título a receber
   * GET /api/parcelas/tituloReceber/:idParcela/movimentos
   */
  consultarMovimentosParcelaTituloReceber(req: Request, res: Response): Promise<void>;
}
