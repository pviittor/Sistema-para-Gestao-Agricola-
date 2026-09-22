import { Request, Response } from 'express';

/**
 * Interface para Controller de ConfiguradorCiclo
 */
export interface IConfiguradorCicloController {
  index(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  getByFazendaAndSafra(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
}
