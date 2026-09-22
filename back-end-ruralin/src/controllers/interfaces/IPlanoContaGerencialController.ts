import { Request, Response } from 'express';

/**
 * Interface para Controller de PlanoContaGerencial
 */
export interface IPlanoContaGerencialController {
  /**
   * Lista todas as contas paginadas
   */
  index(req: Request, res: Response): Promise<void>;

  /**
   * Busca uma conta por ID
   */
  show(req: Request, res: Response): Promise<void>;

  /**
   * Cria uma nova conta
   */
  create(req: Request, res: Response): Promise<void>;

  /**
   * Atualiza uma conta existente
   */
  update(req: Request, res: Response): Promise<void>;

  /**
   * Deleta uma conta
   */
  delete(req: Request, res: Response): Promise<void>;

  /**
   * Busca todas as contas de um nível específico
   */
  findByNivel(req: Request, res: Response): Promise<void>;

  /**
   * Busca todas as contas de um tipo específico
   */
  findByTipo(req: Request, res: Response): Promise<void>;

  /**
   * Busca todas as contas filhas de uma conta pai
   */
  findByContaPai(req: Request, res: Response): Promise<void>;

  /**
   * Busca a árvore completa de contas a partir de uma conta raiz
   */
  findArvore(req: Request, res: Response): Promise<void>;

  /**
   * Busca contas por tipo de fluxo financeiro (RECEITA ou DESPESA)
   */
  findByTipoFluxo(req: Request, res: Response): Promise<void>;
}
