import { Request, Response } from 'express';

/**
 * Interface para Controller de ItemNotaFiscal
 */
export interface IItemNotaFiscalController {
  index(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
  findByNotaFiscal(req: Request, res: Response): Promise<void>;
  findByProduto(req: Request, res: Response): Promise<void>;
  findByLote(req: Request, res: Response): Promise<void>;
  findByNumeroSerie(req: Request, res: Response): Promise<void>;
  totalVendidoPorProduto(req: Request, res: Response): Promise<void>;
}
