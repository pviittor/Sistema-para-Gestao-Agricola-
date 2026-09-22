import { Request, Response } from 'express';

/**
 * Interface para Controller de PrincipioAtivo
 * 
 * Define os métodos HTTP disponíveis para operações com princípio ativo.
 */
export interface IPrincipioAtivoController {
  /**
   * Lista todas as princípios ativos com paginação
   * GET /api/principiosAtivo?page=1&limit=10
   */
  index(req: Request, res: Response): Promise<void>;

  /**
   * Busca um princípio ativo por ID
   * GET /api/principiosAtivo/:id
   */
  show(req: Request, res: Response): Promise<void>;

  /**
   * Cria um novo princípio ativo
   * POST /api/principiosAtivo
   */
  create(req: Request, res: Response): Promise<void>;

  /**
   * Atualiza um princípio ativo existente
   * PUT /api/principiosAtivo/:id
   */
  update(req: Request, res: Response): Promise<void>;

  /**
   * Remove um princípio ativo
   * DELETE /api/principiosAtivo/:id
   */
  delete(req: Request, res: Response): Promise<void>;
}
