/**
 * UsuarioRepository - Repositório para entidade Usuario
 * 
 * Implementa IUsuarioRepository estendendo BaseRepository e adiciona
 * métodos específicos para busca de usuários por email e username.
 * 
 * @example
 * ```typescript
 * import { UsuarioRepository } from './UsuarioRepository';
 * 
 * const repository = new UsuarioRepository();
 * const usuario = await repository.findByEmail('usuario@example.com');
 * ```
 */

import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IUsuarioRepository } from './IUsuarioRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import Usuario from '../../models/Usuario';
import { ILogger } from '../../core/logger/ILogger';

/**
 * Repositório para entidade Usuario
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca por email e username.
 */
@Injectable()
export class UsuarioRepository extends BaseRepository<Usuario> implements IUsuarioRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo Usuario, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService,
    @Inject(TYPES.ILogger) private logger: ILogger
  ) {
    super(Usuario, cacheService, tenantService);
  }

  /**
   * Busca um usuário por email
   * 
   * Este método não aplica filtro de tenant porque é usado durante login,
   * quando o tenant ainda não foi identificado.
   * 
   * @param email - Email do usuário
   * @returns Promise que resolve com o usuário encontrado ou null
   */
  async findByEmail(email: string): Promise<Usuario | null> {
    this.logger.debug(`localizando email para autenticação: ${email}`);
    // Usar findOneWithoutTenant porque login não tem tenant ainda
    return await this.findOneWithoutTenant({ where: { email } });
  }

  /**
   * Busca um usuário por username
   * 
   * Este método não aplica filtro de tenant porque é usado durante login,
   * quando o tenant ainda não foi identificado.
   * 
   * @param username - Username do usuário
   * @returns Promise que resolve com o usuário encontrado ou null
   */
  async findByUsername(username: string): Promise<Usuario | null> {
    this.logger.debug(`localizando username para autenticação: ${username}`);
    // Usar findOneWithoutTenant porque login não tem tenant ainda
    return await this.findOneWithoutTenant({ where: { username } });
  }
}
