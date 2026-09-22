import { Request, Response } from 'express';

/**
 * Interface para Controller de Safra
 */
export interface ISafraController {
  index(req: Request, res: Response): Promise<void>;
  listAll(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  findByCultura(req: Request, res: Response): Promise<void>;
  findByStatus(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
}
