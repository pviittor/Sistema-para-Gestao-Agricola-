import { Request, Response } from 'express';

/**
 * Interface para Controller de GrupoProduto
 * 
 * Define os métodos HTTP disponíveis para operações com grupo de produto.
 */
export interface IGrupoProdutoController {
  /**
   * Lista todas as grupos de produto com paginação
   * GET /api/gruposProduto?page=1&limit=10
   */
  index(req: Request, res: Response): Promise<void>;

  /**
   * Busca um grupo de produto por ID
   * GET /api/gruposProduto/:id
   */
  show(req: Request, res: Response): Promise<void>;

  /**
   * Cria um novo grupo de produto
   * POST /api/gruposProduto
   */
  create(req: Request, res: Response): Promise<void>;

  /**
   * Atualiza um grupo de produto existente
   * PUT /api/gruposProduto/:id
   */
  update(req: Request, res: Response): Promise<void>;

  /**
   * Remove um grupo de produto
   * DELETE /api/gruposProduto/:id
   */
  delete(req: Request, res: Response): Promise<void>;
}
