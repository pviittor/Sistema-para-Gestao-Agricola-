import { Request, Response } from 'express';

/**
 * Interface para Controller de TituloPagar
 * 
 * Define os métodos HTTP disponíveis para operações com títulos a pagar.
 */
export interface ITituloPagarController {
  /**
   * Lista todos os títulos a pagar com paginação
   * GET /api/titulosPagar?page=1&limit=10
   */
  index(req: Request, res: Response): Promise<void>;

  /**
   * Busca um título a pagar por ID
   * GET /api/titulosPagar/:id
   */
  show(req: Request, res: Response): Promise<void>;

  /**
   * Cria um novo título a pagar
   * POST /api/titulosPagar
   */
  create(req: Request, res: Response): Promise<void>;

  /**
   * Atualiza um título a pagar existente
   * PUT /api/titulosPagar/:id
   */
  update(req: Request, res: Response): Promise<void>;

  /**
   * Remove um título a pagar
   * DELETE /api/titulosPagar/:id
   */
  delete(req: Request, res: Response): Promise<void>;

  /**
   * Busca títulos a pagar por safra
   * GET /api/titulosPagar/safra/:idSafra?page=1&limit=10
   */
  findBySafra(req: Request, res: Response): Promise<void>;

  /**
   * Busca títulos a pagar por fazenda
   * GET /api/titulosPagar/fazenda/:idFazenda?page=1&limit=10
   */
  findByFazenda(req: Request, res: Response): Promise<void>;

  /**
   * Busca títulos a pagar por fornecedor
   * GET /api/titulosPagar/fornecedor/:idFornecedor?page=1&limit=10
   */
  findByFornecedor(req: Request, res: Response): Promise<void>;

  /**
   * Busca títulos a pagar por status
   * GET /api/titulosPagar/status/:status?page=1&limit=10
   */
  findByStatus(req: Request, res: Response): Promise<void>;

  /**
   * Busca títulos a pagar por período de lançamento
   * GET /api/titulosPagar/dataLancamento?dataInicio=2024-01-01&dataFim=2024-12-31&page=1&limit=10
   */
  findByDataLancamento(req: Request, res: Response): Promise<void>;

  /**
   * Cancela um título a pagar
   * POST /api/titulosPagar/:id/cancelar
   */
  cancelar(req: Request, res: Response): Promise<void>;

  /**
   * Cria um título a pagar completo com parcelas e rateios em uma única requisição
   * POST /api/titulosPagar/completo
   */
  createCompleto(req: Request, res: Response): Promise<void>;

  /**
   * Retorna KPIs consolidados dos títulos a pagar
   * GET /api/titulosPagar/kpis
   */
  getKpis(req: Request, res: Response): Promise<void>;
}
