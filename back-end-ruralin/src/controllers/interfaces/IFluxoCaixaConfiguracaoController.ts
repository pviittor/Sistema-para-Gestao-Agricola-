import { Request, Response } from 'express';

export interface IFluxoCaixaConfiguracaoController {
  getByTenant(req: Request, res: Response): Promise<void>;
  upsertByTenant(req: Request, res: Response): Promise<void>;
}
