import { Request, Response } from 'express';

/**
 * Interface para Controller de OutraDespesaReceita
 */
export interface IOutraDespesaReceitaController {
  /**
   * Lista todas as outras despesas/receitas paginadas
   */
  index(req: Request, res: Response): Promise<void>;

  /**
   * Busca uma outra despesa/receita por ID
   */
  show(req: Request, res: Response): Promise<void>;

  /**
   * Cria uma nova outra despesa/receita
   */
  create(req: Request, res: Response): Promise<void>;

  /**
   * Atualiza uma outra despesa/receita existente
   */
  update(req: Request, res: Response): Promise<void>;

  /**
   * Remove uma outra despesa/receita
   */
  delete(req: Request, res: Response): Promise<void>;

  /**
   * Busca outras despesas/receitas por filtros combinados
   */
  findByFilters(req: Request, res: Response): Promise<void>;

  /**
   * Busca outras despesas/receitas por cultura
   */
  findByCultura(req: Request, res: Response): Promise<void>;
}
