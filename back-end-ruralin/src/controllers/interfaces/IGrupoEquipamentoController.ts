import { Request, Response } from 'express';

/**
 * Interface para Controller de GrupoEquipamento
 *
 * Define os métodos HTTP disponíveis para operações com grupo de equipamento.
 */
export interface IGrupoEquipamentoController {
  /**
   * Lista todos os grupos de equipamento com paginação
   * GET /api/gruposEquipamento?page=1&limit=10
   */
  index(req: Request, res: Response): Promise<void>;

  /**
   * Busca um grupo de equipamento por ID
   * GET /api/gruposEquipamento/:id
   */
  show(req: Request, res: Response): Promise<void>;

  /**
   * Cria um novo grupo de equipamento
   * POST /api/gruposEquipamento
   */
  create(req: Request, res: Response): Promise<void>;

  /**
   * Atualiza um grupo de equipamento existente
   * PUT /api/gruposEquipamento/:id
   */
  update(req: Request, res: Response): Promise<void>;

  /**
   * Remove um grupo de equipamento
   * DELETE /api/gruposEquipamento/:id
   */
  delete(req: Request, res: Response): Promise<void>;
}
