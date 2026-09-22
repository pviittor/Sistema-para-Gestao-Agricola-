import { Request, Response } from 'express';

/**
 * Interface para Controller de Fazenda
 */
export interface IFazendaController {
  index(req: Request, res: Response): Promise<void>;
  listAll(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  findByPessoa(req: Request, res: Response): Promise<void>;
  findByMunicipio(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
}
