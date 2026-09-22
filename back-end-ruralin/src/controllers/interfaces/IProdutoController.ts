import { Request, Response } from 'express';

/**
 * Interface para Controller de Produto
 */
export interface IProdutoController {
  index(req: Request, res: Response): Promise<void>;
  listAll(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
  findByGrupo(req: Request, res: Response): Promise<void>;
  findBySubGrupo(req: Request, res: Response): Promise<void>;
}
