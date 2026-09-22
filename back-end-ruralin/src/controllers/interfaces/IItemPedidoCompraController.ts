import { Request, Response } from 'express';

/**
 * Interface para Controller de ItemPedidoCompra
 */
export interface IItemPedidoCompraController {
  index(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
  findByPedidoCompra(req: Request, res: Response): Promise<void>;
  findPendentesByPedido(req: Request, res: Response): Promise<void>;
  findByProduto(req: Request, res: Response): Promise<void>;
  totalCompradoPorProduto(req: Request, res: Response): Promise<void>;
}
