import { Request, Response } from 'express';

/**
 * Interface para o controller de NumeracaoNfe
 */
export interface INumeracaoNfeController {
  index(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
  consultarProximo(req: Request, res: Response): Promise<void>;
}
