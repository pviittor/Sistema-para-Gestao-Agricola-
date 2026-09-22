/**
 * CacheInvalidationService - Serviço para Invalidação Avançada de Cache
 * 
 * Este serviço fornece estratégias avançadas de invalidação de cache:
 * - Invalidação em cascata: quando uma entidade é atualizada, invalida relacionadas
 * - Invalidação parcial: invalidar apenas entradas específicas
 * - Configuração de relacionamentos para invalidação automática
 * 
 * @example
 * ```typescript
 * const invalidationService = container.resolve<ICacheInvalidationService>(TYPES.ICacheInvalidationService);
 * 
 * // Invalidar em cascata: quando atualizar Usuario, invalidar seus Eventos
 * await invalidationService.invalidateCascade('usuario', 1);
 * ```
 */

import { injectable, inject } from 'tsyringe';
import { ICacheService } from './ICacheService';
import { TYPES } from '../di/types';
import { ILogger } from '../logger/ILogger';

/**
 * Configuração de relacionamento para invalidação em cascata
 */
export interface CascadeRelationship {
  /**
   * Nome da entidade relacionada (ex: 'evento', 'lembrete')
   */
  entity: string;

  /**
   * Nome do campo de relacionamento (ex: 'usuarioId', 'localId')
   */
  foreignKey: string;
}

/**
 * Interface para CacheInvalidationService
 */
export interface ICacheInvalidationService {
  /**
   * Invalida cache em cascata quando uma entidade é atualizada
   * 
   * @param entityName - Nome da entidade (ex: 'usuario')
   * @param entityId - ID da entidade
   * @returns Promise que resolve com número de chaves invalidadas
   */
  invalidateCascade(entityName: string, entityId: number | string): Promise<number>;

  /**
   * Invalida cache parcialmente, mantendo outras entradas
   * 
   * @param keys - Array de chaves específicas a serem invalidadas
   * @returns Promise que resolve com número de chaves invalidadas
   */
  invalidatePartial(keys: string[]): Promise<number>;

  /**
   * Registra relacionamento para invalidação em cascata
   * 
   * @param entityName - Nome da entidade principal
   * @param relationship - Configuração do relacionamento
   */
  registerCascadeRelationship(entityName: string, relationship: CascadeRelationship): void;
}

/**
 * Serviço para invalidação avançada de cache
 */
@injectable()
export class CacheInvalidationService implements ICacheInvalidationService {
  /**
   * Mapa de relacionamentos para invalidação em cascata
   * Chave: nome da entidade principal
   * Valor: array de relacionamentos
   */
  private cascadeRelationships: Map<string, CascadeRelationship[]> = new Map();

  constructor(
    @inject(TYPES.ICacheService) private cacheService: ICacheService,
    @inject(TYPES.ILogger) private logger: ILogger
  ) {
    // Registrar relacionamentos padrão
    this.registerDefaultRelationships();
  }

  /**
   * Registra relacionamentos padrão do sistema
   */
  private registerDefaultRelationships(): void {
    // Quando atualizar Usuario, invalidar seus Eventos, Lembretes, Locais
    this.registerCascadeRelationship('usuario', { entity: 'evento', foreignKey: 'usuarioId' });
    this.registerCascadeRelationship('usuario', { entity: 'lembrete', foreignKey: 'usuarioId' });
    this.registerCascadeRelationship('usuario', { entity: 'local', foreignKey: 'usuarioId' });

    // Quando atualizar Local, invalidar seus Eventos
    this.registerCascadeRelationship('local', { entity: 'evento', foreignKey: 'localId' });
  }

  /**
   * Invalida cache em cascata quando uma entidade é atualizada
   */
  async invalidateCascade(entityName: string, entityId: number | string): Promise<number> {
    const relationships = this.cascadeRelationships.get(entityName.toLowerCase());
    
    if (!relationships || relationships.length === 0) {
      this.logger.debug(`No cascade relationships found for entity: ${entityName}`);
      return 0;
    }

    let totalInvalidated = 0;

    // Invalidar tag da entidade principal
    const entityTag = `${entityName.toLowerCase()}:${entityId}`;
    const invalidatedByTag = await this.cacheService.invalidateByTag(entityTag);
    totalInvalidated += invalidatedByTag;

    // Invalidar entidades relacionadas
    for (const relationship of relationships) {
      const relatedEntityTag = `${relationship.entity}:*:${entityId}`;
      const pattern = `${relationship.entity}:*`;
      
      // Invalidar por padrão (todas as entradas da entidade relacionada)
      // Nota: Em uma implementação mais sofisticada, poderíamos buscar apenas
      // as entradas relacionadas ao entityId específico
      const invalidated = await this.cacheService.deleteByPattern(pattern);
      totalInvalidated += invalidated;

      this.logger.debug(
        `Invalidated ${invalidated} cache entries for related entity: ${relationship.entity} (cascade from ${entityName}:${entityId})`
      );
    }

    this.logger.info(
      `Cascade invalidation completed for ${entityName}:${entityId}. Total invalidated: ${totalInvalidated}`
    );

    return totalInvalidated;
  }

  /**
   * Invalida cache parcialmente, mantendo outras entradas
   */
  async invalidatePartial(keys: string[]): Promise<number> {
    let invalidated = 0;

    for (const key of keys) {
      try {
        await this.cacheService.delete(key);
        invalidated++;
      } catch (error: any) {
        this.logger.error(`Error invalidating cache key "${key}": ${error.message}`, { error, key });
      }
    }

    this.logger.debug(`Partial invalidation completed. Invalidated ${invalidated} of ${keys.length} keys`);

    return invalidated;
  }

  /**
   * Registra relacionamento para invalidação em cascata
   */
  registerCascadeRelationship(entityName: string, relationship: CascadeRelationship): void {
    const normalizedName = entityName.toLowerCase();
    
    if (!this.cascadeRelationships.has(normalizedName)) {
      this.cascadeRelationships.set(normalizedName, []);
    }

    const relationships = this.cascadeRelationships.get(normalizedName)!;
    
    // Evitar duplicatas
    const exists = relationships.some(
      r => r.entity === relationship.entity && r.foreignKey === relationship.foreignKey
    );

    if (!exists) {
      relationships.push(relationship);
      this.logger.debug(
        `Registered cascade relationship: ${entityName} -> ${relationship.entity} (via ${relationship.foreignKey})`
      );
    }
  }
}
