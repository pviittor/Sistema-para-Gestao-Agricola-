import { Request, Response } from 'express';

export interface IReciboController {
  index(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
  cancelar(req: Request, res: Response): Promise<void>;
  getKpis(req: Request, res: Response): Promise<void>;
  prePreencherDeParcela(req: Request, res: Response): Promise<void>;
  gerarPdf(req: Request, res: Response): Promise<void>;
  exportarLote(req: Request, res: Response): Promise<void>;
}
