import { Request, Response } from 'express';

export interface IAgreementController {
  index(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
  findByFazenda(req: Request, res: Response): Promise<void>;
  findByType(req: Request, res: Response): Promise<void>;
  findByField(req: Request, res: Response): Promise<void>;
  findActiveByPeriod(req: Request, res: Response): Promise<void>;
  createCompleto(req: Request, res: Response): Promise<void>;
  updateCompleto(req: Request, res: Response): Promise<void>;
}
