/**
 * TEMPLATE: Controller Interface
 * 
 * Variáveis de substituição:
 * - {{EntityName}}: Nome da entidade em PascalCase
 */

import { Request, Response } from 'express';

/**
 * Interface para Controller de {{EntityName}}
 * 
 * Define os métodos HTTP disponíveis para operações com {{entityName}}.
 */
export interface I{{EntityName}}Controller {
  /**
   * Lista todas as {{entityName}}s com paginação
   * GET /api/{{entityName}}s?page=1&limit=10
   */
  index(req: Request, res: Response): Promise<void>;

  /**
   * Busca uma {{entityName}} por ID
   * GET /api/{{entityName}}s/:id
   */
  show(req: Request, res: Response): Promise<void>;

  /**
   * Cria uma nova {{entityName}}
   * POST /api/{{entityName}}s
   */
  create(req: Request, res: Response): Promise<void>;

  /**
   * Atualiza uma {{entityName}} existente
   * PUT /api/{{entityName}}s/:id
   */
  update(req: Request, res: Response): Promise<void>;

  /**
   * Remove uma {{entityName}}
   * DELETE /api/{{entityName}}s/:id
   */
  delete(req: Request, res: Response): Promise<void>;
}
