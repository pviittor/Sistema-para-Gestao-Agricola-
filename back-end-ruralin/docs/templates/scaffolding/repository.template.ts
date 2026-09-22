/**
 * TEMPLATE: Repository Implementation
 * 
 * Variáveis de substituição:
 * - {{EntityName}}: Nome da entidade em PascalCase
 */

import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { I{{EntityName}}Repository } from './I{{EntityName}}Repository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import {{EntityName}} from '../../models/{{EntityName}}';
// TODO: Importar Op do Sequelize se necessário para queries customizadas
// import { Op } from 'sequelize';

/**
 * Repositório para entidade {{EntityName}}
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de {{entityName}}.
 */
@Injectable()
export class {{EntityName}}Repository extends BaseRepository<{{EntityName}}> implements I{{EntityName}}Repository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo {{EntityName}}, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super({{EntityName}}, cacheService, tenantService);
  }

  // TODO: Implementar métodos customizados baseados na especificação
  // Exemplo:
  // async findByCampo(campo: string): Promise<{{EntityName}} | null> {
  //   return await this.findOne({
  //     where: { campo },
  //   });
  // }
}
