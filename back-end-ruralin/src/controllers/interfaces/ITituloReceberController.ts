import { Request, Response } from 'express';

/**
 * Interface para Controller de TituloReceber
 * 
 * Define os métodos HTTP disponíveis para operações com títulos a receber.
 */
export interface ITituloReceberController {
  /**
   * Lista todos os títulos a receber com paginação
   * GET /api/titulosReceber?page=1&limit=10
   */
  index(req: Request, res: Response): Promise<void>;

  /**
   * Busca um título a receber por ID
   * GET /api/titulosReceber/:id
   */
  show(req: Request, res: Response): Promise<void>;

  /**
   * Cria um novo título a receber
   * POST /api/titulosReceber
   */
  create(req: Request, res: Response): Promise<void>;

  /**
   * Atualiza um título a receber existente
   * PUT /api/titulosReceber/:id
   */
  update(req: Request, res: Response): Promise<void>;

  /**
   * Remove um título a receber
   * DELETE /api/titulosReceber/:id
   */
  delete(req: Request, res: Response): Promise<void>;

  /**
   * Busca títulos a receber por safra
   * GET /api/titulosReceber/safra/:idSafra?page=1&limit=10
   */
  findBySafra(req: Request, res: Response): Promise<void>;

  /**
   * Busca títulos a receber por fazenda
   * GET /api/titulosReceber/fazenda/:idFazenda?page=1&limit=10
   */
  findByFazenda(req: Request, res: Response): Promise<void>;

  /**
   * Busca títulos a receber por cliente
   * GET /api/titulosReceber/cliente/:idCliente?page=1&limit=10
   */
  findByCliente(req: Request, res: Response): Promise<void>;

  /**
   * Busca títulos a receber por status
   * GET /api/titulosReceber/status/:status?page=1&limit=10
   */
  findByStatus(req: Request, res: Response): Promise<void>;

  /**
   * Busca títulos a receber por período de lançamento
   * GET /api/titulosReceber/dataLancamento?dataInicio=2024-01-01&dataFim=2024-12-31&page=1&limit=10
   */
  findByDataLancamento(req: Request, res: Response): Promise<void>;

  /**
   * Cancela um título a receber
   * POST /api/titulosReceber/:id/cancelar
   */
  cancelar(req: Request, res: Response): Promise<void>;

  /**
   * Cria um título a receber completo com parcelas e rateios em uma única requisição
   * POST /api/titulosReceber/completo
   */
  createCompleto(req: Request, res: Response): Promise<void>;

  /**
   * Retorna KPIs consolidados dos títulos a receber
   * GET /api/titulosReceber/kpis
   */
  getKpis(req: Request, res: Response): Promise<void>;
}
