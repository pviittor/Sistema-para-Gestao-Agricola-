import { Request, Response } from 'express';

/**
 * Interface para Controller de NotaFiscal
 */
export interface INotaFiscalController {
  index(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
  cancelar(req: Request, res: Response): Promise<void>;
  autorizar(req: Request, res: Response): Promise<void>;
  inutilizar(req: Request, res: Response): Promise<void>;
  movimentarEstoque(req: Request, res: Response): Promise<void>;
  gerarFinanceiro(req: Request, res: Response): Promise<void>;
  findByPeriodo(req: Request, res: Response): Promise<void>;
  findPendentesMovimentacao(req: Request, res: Response): Promise<void>;
  findPendentesFinanceiro(req: Request, res: Response): Promise<void>;
  totalPorPeriodo(req: Request, res: Response): Promise<void>;
  createCompleto(req: Request, res: Response): Promise<void>;
  updateCompleto(req: Request, res: Response): Promise<void>;
  importarXml(req: Request, res: Response): Promise<void>;
  consultarSefaz(req: Request, res: Response): Promise<void>;
  emitir(req: Request, res: Response): Promise<void>;
  inutilizarFaixa(req: Request, res: Response): Promise<void>;
  ativarContingencia(req: Request, res: Response): Promise<void>;
  desativarContingencia(req: Request, res: Response): Promise<void>;
  statusContingencia(req: Request, res: Response): Promise<void>;
  statusServico(req: Request, res: Response): Promise<void>;
}
