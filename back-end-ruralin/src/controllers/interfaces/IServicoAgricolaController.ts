import { Request, Response } from 'express';

/**
 * Interface para Controller de ServicoAgricola
 */
export interface IServicoAgricolaController {
  index(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
}
