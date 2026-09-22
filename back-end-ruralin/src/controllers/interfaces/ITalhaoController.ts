import { Request, Response } from 'express';

/**
 * Interface para Controller de Talhao
 */
export interface ITalhaoController {
  index(req: Request, res: Response): Promise<void>;
  listAll(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  findByFazenda(req: Request, res: Response): Promise<void>;
  getNdvi(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
}
