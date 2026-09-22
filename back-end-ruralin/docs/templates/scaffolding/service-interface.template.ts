/**
 * TEMPLATE: Application Service Interface
 * 
 * Variáveis de substituição:
 * - {{EntityName}}: Nome da entidade em PascalCase
 */

import { IApplicationService } from '../../core/application/IApplicationService';
import { Create{{EntityName}}Dto } from '../dto/{{entityName}}/Create{{EntityName}}Dto';
import { Update{{EntityName}}Dto } from '../dto/{{entityName}}/Update{{EntityName}}Dto';
import { {{EntityName}}ResponseDto } from '../dto/{{entityName}}/{{EntityName}}ResponseDto';

/**
 * Interface para Application Service de {{EntityName}}
 * 
 * Define os métodos disponíveis para operações de negócio com {{entityName}}.
 */
export interface I{{EntityName}}ApplicationService extends IApplicationService<{{EntityName}}ResponseDto, Create{{EntityName}}Dto, Update{{EntityName}}Dto> {
  // TODO: Adicionar métodos customizados baseados na especificação
  // Exemplo:
  // findByCampo(campo: string): Promise<{{EntityName}}ResponseDto[]>;
}
