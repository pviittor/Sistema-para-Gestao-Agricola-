import { Request, Response } from 'express';

/**
 * Interface para Controller de MoedaCotacao
 */
export interface IMoedaCotacaoController {
  index(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
  findByMoeda(req: Request, res: Response): Promise<void>;
  findByData(req: Request, res: Response): Promise<void>;
}
