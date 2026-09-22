import { Request, Response } from 'express';

/**
 * Interface para PermissaoController
 */
export interface IPermissaoController {
  index(req: Request, res: Response): Promise<void | Response>;
  show(req: Request, res: Response): Promise<void | Response>;
  create(req: Request, res: Response): Promise<void | Response>;
  update(req: Request, res: Response): Promise<void | Response>;
  delete(req: Request, res: Response): Promise<void | Response>;
}
