import { Request, Response } from 'express';

/**
 * Interface para ConsultoriaController
 */
export interface IConsultoriaController {
  index(req: Request, res: Response): Promise<Response | void>;
  show(req: Request, res: Response): Promise<Response | void>;
  create(req: Request, res: Response): Promise<Response | void>;
  update(req: Request, res: Response): Promise<Response | void>;
  delete(req: Request, res: Response): Promise<Response | void>;
  desativar(req: Request, res: Response): Promise<Response | void>;
  ativar(req: Request, res: Response): Promise<Response | void>;
  aumentarLimiteTenants(req: Request, res: Response): Promise<Response | void>;
  listarTenants(req: Request, res: Response): Promise<Response | void>;
}
