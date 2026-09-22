import { Request, Response } from 'express';

/**
 * Interface para Controller de ApontamentoServico
 */
export interface IApontamentoServicoController {
  index(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
}
