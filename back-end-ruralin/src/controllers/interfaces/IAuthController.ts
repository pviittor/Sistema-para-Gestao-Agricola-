import { Request, Response } from 'express';

/**
 * Interface para AuthController
 * 
 * Define os métodos de autenticação do sistema.
 */
export interface IAuthController {
  /**
   * Autentica um usuário e retorna token JWT
   * 
   * @param req - Request do Express com email e senha no body
   * @param res - Response do Express
   */
  authenticate(req: Request, res: Response): Promise<Response | void>;

  /**
   * Renova o token JWT usando refresh token
   * 
   * @param req - Request do Express com refreshToken no body
   * @param res - Response do Express
   */
  refresh(req: Request, res: Response): Promise<Response | void>;
}
