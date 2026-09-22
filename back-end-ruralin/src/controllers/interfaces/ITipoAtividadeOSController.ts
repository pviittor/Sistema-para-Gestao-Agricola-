import { Request, Response } from 'express';

/**
 * Interface para Controller de TipoAtividadeOS
 *
 * Define os métodos HTTP disponíveis para operações com tipos de atividade de OS.
 */
export interface ITipoAtividadeOSController {
  /**
   * Lista tipos de atividade OS com paginação
   * GET /api/tipos-atividade-os?page=1&limit=10
   */
  list(req: Request, res: Response): Promise<void>;

  /**
   * Lista todos os tipos de atividade OS sem paginação (para selects/combos)
   * GET /api/tipos-atividade-os/all
   */
  listAll(req: Request, res: Response): Promise<void>;

  /**
   * Busca um tipo de atividade OS por ID
   * GET /api/tipos-atividade-os/:id
   */
  getById(req: Request, res: Response): Promise<void>;

  /**
   * Cria um tipo de atividade OS completo com campos condicionais
   * POST /api/tipos-atividade-os/completo
   */
  createCompleto(req: Request, res: Response): Promise<void>;

  /**
   * Atualiza um tipo de atividade OS completo com campos condicionais
   * PUT /api/tipos-atividade-os/:id/completo
   */
  updateCompleto(req: Request, res: Response): Promise<void>;

  /**
   * Remove um tipo de atividade OS
   * DELETE /api/tipos-atividade-os/:id
   */
  delete(req: Request, res: Response): Promise<void>;
}
