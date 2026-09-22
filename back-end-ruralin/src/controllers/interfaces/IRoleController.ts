import { Request, Response } from 'express';

/**
 * Interface para RoleController
 */
export interface IRoleController {
  index(req: Request, res: Response): Promise<void | Response>;
  show(req: Request, res: Response): Promise<void | Response>;
  create(req: Request, res: Response): Promise<void | Response>;
  update(req: Request, res: Response): Promise<void | Response>;
  delete(req: Request, res: Response): Promise<void | Response>;
}
