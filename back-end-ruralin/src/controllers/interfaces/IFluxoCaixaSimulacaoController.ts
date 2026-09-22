import { Request, Response } from 'express';

export interface IFluxoCaixaSimulacaoController {
  index(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  createCompleto(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
  calcular(req: Request, res: Response): Promise<void>;
  addItem(req: Request, res: Response): Promise<void>;
  updateItem(req: Request, res: Response): Promise<void>;
  deleteItem(req: Request, res: Response): Promise<void>;
}
