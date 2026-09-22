import { Request, Response } from 'express';

/**
 * Interface para EmprestimoItemController
 */
export interface IEmprestimoItemController {
  index(req: Request, res: Response): Promise<Response | void>;
  show(req: Request, res: Response): Promise<Response | void>;
  create(req: Request, res: Response): Promise<Response | void>;
  update(req: Request, res: Response): Promise<Response | void>;
  delete(req: Request, res: Response): Promise<Response | void>;
  findByEmprestimo(req: Request, res: Response): Promise<Response | void>;
}
