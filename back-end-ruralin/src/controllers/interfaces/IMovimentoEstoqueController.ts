import { Request, Response } from 'express';

/**
 * Interface para Controller de MovimentoEstoque
 */
export interface IMovimentoEstoqueController {
  index(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
  getSaldoProduto(req: Request, res: Response): Promise<void>;
  getSaldoPorOperacao(req: Request, res: Response): Promise<void>;
  validarDisponibilidade(req: Request, res: Response): Promise<void>;
  posicaoEstoque(req: Request, res: Response): Promise<void>;
  kardex(req: Request, res: Response): Promise<void>;
  posicaoProduto(req: Request, res: Response): Promise<void>;
  extrato(req: Request, res: Response): Promise<void>;
  historicoPrecos(req: Request, res: Response): Promise<void>;
}
