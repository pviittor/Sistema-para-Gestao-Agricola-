import { Request, Response } from 'express';

/**
 * Interface para Controller de Cfop
 *
 * Define os métodos HTTP disponíveis para operações com CFOP.
 */
export interface ICfopController {
  /**
   * Lista todos os CFOPs com paginação
   * GET /api/cfops?page=1&limit=10
   */
  index(req: Request, res: Response): Promise<void>;

  /**
   * Busca um CFOP por ID
   * GET /api/cfops/:id
   */
  show(req: Request, res: Response): Promise<void>;

  /**
   * Cria um novo CFOP
   * POST /api/cfops
   */
  create(req: Request, res: Response): Promise<void>;

  /**
   * Atualiza um CFOP existente
   * PUT /api/cfops/:id
   */
  update(req: Request, res: Response): Promise<void>;

  /**
   * Remove um CFOP
   * DELETE /api/cfops/:id
   */
  delete(req: Request, res: Response): Promise<void>;

  /**
   * Lista todos os CFOPs ativos sem paginação
   * GET /api/cfops/all
   */
  listAll(req: Request, res: Response): Promise<void>;
}
