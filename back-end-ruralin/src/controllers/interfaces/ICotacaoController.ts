import { Request, Response } from 'express'

/**
 * Interface para Controller de Cotacao
 */
export interface ICotacaoController {
  index(req: Request, res: Response): Promise<void>
  show(req: Request, res: Response): Promise<void>
  create(req: Request, res: Response): Promise<void>
  createCompleto(req: Request, res: Response): Promise<void>
  update(req: Request, res: Response): Promise<void>
  updateCompleto(req: Request, res: Response): Promise<void>
  delete(req: Request, res: Response): Promise<void>
  findByPedidoCompra(req: Request, res: Response): Promise<void>
  ranking(req: Request, res: Response): Promise<void>
  selecionar(req: Request, res: Response): Promise<void>
}
