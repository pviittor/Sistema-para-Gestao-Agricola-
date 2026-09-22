import { Request, Response } from 'express';

/**
 * Interface para Controller de UnidadeMedida
 * 
 * Define os métodos HTTP disponíveis para operações com unidade de medida.
 */
export interface IUnidadeMedidaController {
  /**
   * Lista todas as unidades de medida com paginação
   * GET /api/unidadesMedida?page=1&limit=10
   */
  index(req: Request, res: Response): Promise<void>;

  /**
   * Busca uma unidade de medida por ID
   * GET /api/unidadesMedida/:id
   */
  show(req: Request, res: Response): Promise<void>;

  /**
   * Cria uma nova unidade de medida
   * POST /api/unidadesMedida
   */
  create(req: Request, res: Response): Promise<void>;

  /**
   * Atualiza uma unidade de medida existente
   * PUT /api/unidadesMedida/:id
   */
  update(req: Request, res: Response): Promise<void>;

  /**
   * Remove uma unidade de medida
   * DELETE /api/unidadesMedida/:id
   */
  delete(req: Request, res: Response): Promise<void>;
}
