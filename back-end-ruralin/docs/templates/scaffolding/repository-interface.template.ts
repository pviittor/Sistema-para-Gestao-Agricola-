/**
 * TEMPLATE: Repository Interface
 * 
 * Variáveis de substituição:
 * - {{EntityName}}: Nome da entidade em PascalCase
 */

import { IRepository } from '../../core/repository/IRepository';
import {{EntityName}} from '../../models/{{EntityName}}';

/**
 * Interface para repositório de {{EntityName}}
 * 
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de {{entityName}}.
 */
export interface I{{EntityName}}Repository extends IRepository<{{EntityName}}> {
  // TODO: Adicionar métodos customizados baseados na especificação
  // Exemplo:
  // findByCampo(campo: string): Promise<{{EntityName}} | null>;
}
