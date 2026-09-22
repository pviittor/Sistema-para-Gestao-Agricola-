import { Request, Response } from 'express';

export interface IRecorrenciaFinanceiraController {
  index(req: Request, res: Response): Promise<void>;
  getKpis(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  destroy(req: Request, res: Response): Promise<void>;
  toggleAtiva(req: Request, res: Response): Promise<void>;
  gerarAgora(req: Request, res: Response): Promise<void>;
  preview(req: Request, res: Response): Promise<void>;
  lancamentos(req: Request, res: Response): Promise<void>;
}
