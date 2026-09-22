import { Request, Response } from 'express';

/**
 * Interface para EmprestimoItemDevolucaoController
 */
export interface IEmprestimoItemDevolucaoController {
  index(req: Request, res: Response): Promise<Response | void>;
  show(req: Request, res: Response): Promise<Response | void>;
  create(req: Request, res: Response): Promise<Response | void>;
  update(req: Request, res: Response): Promise<Response | void>;
  delete(req: Request, res: Response): Promise<Response | void>;
  findByItem(req: Request, res: Response): Promise<Response | void>;
}
