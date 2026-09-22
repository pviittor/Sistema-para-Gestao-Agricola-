import { Request, Response } from 'express';

/**
 * Interface para EmprestimoController
 */
export interface IEmprestimoController {
  index(req: Request, res: Response): Promise<Response | void>;
  show(req: Request, res: Response): Promise<Response | void>;
  create(req: Request, res: Response): Promise<Response | void>;
  update(req: Request, res: Response): Promise<Response | void>;
  delete(req: Request, res: Response): Promise<Response | void>;
  findByParceiro(req: Request, res: Response): Promise<Response | void>;
  findByFazenda(req: Request, res: Response): Promise<Response | void>;
  findBySituacao(req: Request, res: Response): Promise<Response | void>;
  createCompleto(req: Request, res: Response): Promise<void>;
  updateCompleto(req: Request, res: Response): Promise<void>;
  gerarFinanceiro(req: Request, res: Response): Promise<void>;
}
