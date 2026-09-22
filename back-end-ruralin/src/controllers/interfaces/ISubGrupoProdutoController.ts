import { Request, Response } from 'express';

/**
 * Interface para Controller de SubGrupoProduto
 * 
 * Define os métodos HTTP disponíveis para operações com subgrupo de produto.
 */
export interface ISubGrupoProdutoController {
  /**
   * Lista todas as subgrupos de produto com paginação
   * GET /api/subGruposProduto?page=1&limit=10
   */
  index(req: Request, res: Response): Promise<void>;

  /**
   * Busca um subgrupo de produto por ID
   * GET /api/subGruposProduto/:id
   */
  show(req: Request, res: Response): Promise<void>;

  /**
   * Busca subgrupos por grupo de produto
   * GET /api/subGruposProduto/grupo/:idGrupo
   */
  findByGrupo(req: Request, res: Response): Promise<void>;

  /**
   * Cria um novo subgrupo de produto
   * POST /api/subGruposProduto
   */
  create(req: Request, res: Response): Promise<void>;

  /**
   * Atualiza um subgrupo de produto existente
   * PUT /api/subGruposProduto/:id
   */
  update(req: Request, res: Response): Promise<void>;

  /**
   * Remove um subgrupo de produto
   * DELETE /api/subGruposProduto/:id
   */
  delete(req: Request, res: Response): Promise<void>;
}
