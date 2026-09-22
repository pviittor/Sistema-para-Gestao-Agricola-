import { Request, Response } from 'express';

export interface IConfiguracaoReciboController {
  index(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
  getMinhaConfig(req: Request, res: Response): Promise<void>;
}
