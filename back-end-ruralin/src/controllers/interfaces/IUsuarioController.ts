import { Request, Response } from 'express';

/**
 * Interface para UsuarioController
 * 
 * Define os métodos de gerenciamento de usuários.
 */
export interface IUsuarioController {
  /**
   * Lista todos os usuários
   */
  index(req: Request, res: Response): Promise<Response | void>;

  /**
   * Busca um usuário por ID
   */
  show(req: Request, res: Response): Promise<Response | void>;

  /**
   * Cria um novo usuário
   */
  create(req: Request, res: Response): Promise<Response | void>;

  /**
   * Atualiza um usuário existente
   */
  update(req: Request, res: Response): Promise<Response | void>;

  /**
   * Deleta um usuário
   */
  delete(req: Request, res: Response): Promise<Response | void>;

  /**
   * Retorna dados do usuário autenticado
   */
  me(req: Request, res: Response): Promise<Response | void>;
}
