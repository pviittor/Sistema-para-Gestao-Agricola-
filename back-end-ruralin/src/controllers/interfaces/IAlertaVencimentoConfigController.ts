import { Request, Response } from 'express';

export interface IAlertaVencimentoConfigController {
  index(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  destroy(req: Request, res: Response): Promise<void>;
}
