import { Request, Response } from 'express';

/**
 * Interface para Controller de BaixaPedidoCompra
 */
export interface IBaixaPedidoCompraController {
  index(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
  processar(req: Request, res: Response): Promise<void>;
  cancelar(req: Request, res: Response): Promise<void>;
  findByNotaFiscal(req: Request, res: Response): Promise<void>;
  findByPedidoCompra(req: Request, res: Response): Promise<void>;
  findByFornecedor(req: Request, res: Response): Promise<void>;
  findPendentes(req: Request, res: Response): Promise<void>;
  findByPeriodo(req: Request, res: Response): Promise<void>;
}
