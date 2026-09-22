import { Request, Response } from 'express';

/**
 * Interface para TenantController
 */
export interface ITenantController {
  index(req: Request, res: Response): Promise<Response | void>;
  show(req: Request, res: Response): Promise<Response | void>;
  create(req: Request, res: Response): Promise<Response | void>;
  update(req: Request, res: Response): Promise<Response | void>;
  delete(req: Request, res: Response): Promise<Response | void>;
  desativar(req: Request, res: Response): Promise<Response | void>;
  ativar(req: Request, res: Response): Promise<Response | void>;
  getStatus(req: Request, res: Response): Promise<Response | void>;
}
