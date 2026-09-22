import { Request, Response } from 'express';

/**
 * Interface para Controller de ApontamentoMaquinas
 */
export interface IApontamentoMaquinasController {
  index(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
}
