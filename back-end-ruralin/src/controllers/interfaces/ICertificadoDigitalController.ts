import { Request, Response } from 'express';

/**
 * Interface para Controller de CertificadoDigital
 */
export interface ICertificadoDigitalController {
  /**
   * Lista todos os certificados digitais paginados
   */
  index(req: Request, res: Response): Promise<void>;

  /**
   * Busca um certificado digital por ID
   */
  show(req: Request, res: Response): Promise<void>;

  /**
   * Cria um novo certificado digital
   */
  create(req: Request, res: Response): Promise<void>;

  /**
   * Atualiza um certificado digital existente
   */
  update(req: Request, res: Response): Promise<void>;

  /**
   * Remove um certificado digital
   */
  delete(req: Request, res: Response): Promise<void>;

  /**
   * Define um certificado como padrão do tenant
   */
  setPadrao(req: Request, res: Response): Promise<void>;

  /**
   * Faz upload de um arquivo .pfx/.p12
   */
  upload(req: Request, res: Response): Promise<void>;
}
