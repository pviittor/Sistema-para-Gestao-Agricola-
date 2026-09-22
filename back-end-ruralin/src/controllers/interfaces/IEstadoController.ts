import { Request, Response } from 'express';

/**
 * Interface para Controller de Estado
 */
export interface IEstadoController {
  index(req: Request, res: Response): Promise<void>;
  listAll(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  findBySigla(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
}
