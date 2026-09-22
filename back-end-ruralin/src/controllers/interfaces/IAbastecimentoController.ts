import { Request, Response } from 'express';

/**
 * Interface para Controller de Abastecimento
 */
export interface IAbastecimentoController {
  index(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
  findByMaquina(req: Request, res: Response): Promise<void>;
  findByPeriodo(req: Request, res: Response): Promise<void>;
}
