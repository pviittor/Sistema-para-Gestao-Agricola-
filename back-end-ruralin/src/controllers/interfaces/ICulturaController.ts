import { Request, Response } from 'express';

/**
 * Interface para Controller de Cultura
 */
export interface ICulturaController {
  index(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
  findByProduto(req: Request, res: Response): Promise<void>;
}
