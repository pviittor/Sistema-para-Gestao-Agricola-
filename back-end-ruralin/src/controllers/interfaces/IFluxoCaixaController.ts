import { Request, Response } from 'express';

export interface IFluxoCaixaController {
  consolidado(req: Request, res: Response): Promise<void>;
  realizado(req: Request, res: Response): Promise<void>;
  projetado(req: Request, res: Response): Promise<void>;
  saldosPorConta(req: Request, res: Response): Promise<void>;
  alertas(req: Request, res: Response): Promise<void>;
  autocompleteProjetados(req: Request, res: Response): Promise<void>;
}
