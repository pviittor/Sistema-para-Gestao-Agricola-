import { Request, Response } from 'express';

/**
 * Interface para Controller de Maquina
 */
export interface IMaquinaController {
  index(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  findByPlaca(req: Request, res: Response): Promise<void>;
  getMotoristaByPlaca(req: Request, res: Response): Promise<void>;
  calcularDepreciacao(req: Request, res: Response): Promise<void>;
  calcularCustoMaquina(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  atualizarHorimetro(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
}
