import { Request, Response } from 'express';

/**
 * Interface para Controller de Conta
 * 
 * Define os métodos HTTP disponíveis para operações com contas.
 */
export interface IContaController {
  /**
   * Lista todas as contas com paginação
   * GET /api/contas?page=1&limit=10
   */
  index(req: Request, res: Response): Promise<void>;

  /**
   * Busca uma conta por ID
   * GET /api/contas/:id
   */
  show(req: Request, res: Response): Promise<void>;

  /**
   * Cria uma nova conta
   * POST /api/contas
   */
  create(req: Request, res: Response): Promise<void>;

  /**
   * Atualiza uma conta existente
   * PUT /api/contas/:id
   */
  update(req: Request, res: Response): Promise<void>;

  /**
   * Remove uma conta
   * DELETE /api/contas/:id
   */
  delete(req: Request, res: Response): Promise<void>;

  /**
   * Busca contas por tipo
   * GET /api/contas/tipo/:tipo
   */
  findByTipo(req: Request, res: Response): Promise<void>;
}
