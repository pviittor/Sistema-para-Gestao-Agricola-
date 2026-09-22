import { Request, Response } from 'express';

/**
 * Interface para Controller de PedidoCompra
 */
export interface IPedidoCompraController {
  index(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
  aprovar(req: Request, res: Response): Promise<void>;
  cancelar(req: Request, res: Response): Promise<void>;
  recalcularTotais(req: Request, res: Response): Promise<void>;
  findByFornecedor(req: Request, res: Response): Promise<void>;
  findByPeriodo(req: Request, res: Response): Promise<void>;
  findPendentesEntrega(req: Request, res: Response): Promise<void>;
  findByNumero(req: Request, res: Response): Promise<void>;
  totalPorPeriodo(req: Request, res: Response): Promise<void>;
  createCompleto(req: Request, res: Response): Promise<void>;
  updateCompleto(req: Request, res: Response): Promise<void>;
  gerarFinanceiro(req: Request, res: Response): Promise<void>;
}
