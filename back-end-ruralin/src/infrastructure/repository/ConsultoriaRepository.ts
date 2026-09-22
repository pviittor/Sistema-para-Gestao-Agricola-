/**
 * ConsultoriaRepository - Repositório para entidade Consultoria
 * 
 * Implementa IConsultoriaRepository estendendo BaseRepository e adiciona
 * métodos específicos para busca de consultorias por CNPJ e status.
 */

import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IConsultoriaRepository } from './IConsultoriaRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import Consultoria from '../../models/Consultoria';
import { Op } from 'sequelize';

/**
 * Repositório para entidade Consultoria
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca por CNPJ e status.
 */
@Injectable()
export class ConsultoriaRepository extends BaseRepository<Consultoria> implements IConsultoriaRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo Consultoria, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Consultoria, cacheService, tenantService);
  }

  /**
   * Busca consultoria por CNPJ
   * 
   * Remove formatação (pontos, traços, barras) antes de buscar.
   * 
   * @param cnpj - CNPJ da consultoria
   * @returns Promise que resolve com a consultoria encontrada ou null
   */
  async findByCnpj(cnpj: string): Promise<Consultoria | null> {
    // Remover formatação
    const cnpjLimpo = cnpj.replace(/[.\-\/]/g, '');

    // Tentar buscar no cache primeiro
    const cacheKey = `consultoria:cnpj:${cnpjLimpo}`;
    const cached = await this.cacheService.get<Consultoria>(cacheKey);
    if (cached) {
      return cached;
    }

    // Buscar no banco (buscar exato ou com formatação)
    const consultoria = await this.model.findOne({
      where: {
        [Op.or]: [
          { cnpj: cnpjLimpo },
          { cnpj: { [Op.like]: `%${cnpjLimpo}%` } },
        ],
      },
    });

    // Cachear resultado se encontrado
    if (consultoria) {
      await this.cacheService.set(cacheKey, consultoria, 3600); // 1 hora
    }

    return consultoria;
  }

  /**
   * Busca consultorias ativas
   * 
   * @returns Promise que resolve com lista de consultorias ativas
   */
  async findAtivas(): Promise<Consultoria[]> {
    const cacheKey = 'consultorias:ativas';
    const cached = await this.cacheService.get<Consultoria[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const consultorias = await this.model.findAll({
      where: {
        ativo: true,
      },
      order: [['razaoSocial', 'ASC']],
    });

    await this.cacheService.set(cacheKey, consultorias, 1800); // 30 minutos

    return consultorias;
  }

  /**
   * Override do método create para invalidar cache de lista
   */
  async create(entity: Partial<Consultoria>): Promise<Consultoria> {
    const result = await super.create(entity);
    await this.invalidateFindAllCache();
    await this.cacheService.delete('consultorias:ativas');
    return result;
  }

  /**
   * Override do método update para invalidar cache
   */
  async update(id: number, entity: Partial<Consultoria>): Promise<Consultoria> {
    const result = await super.update(id, entity);
    await this.cacheService.delete(`consultoria:cnpj:*`);
    await this.cacheService.delete('consultorias:ativas');
    return result;
  }

  /**
   * Override do método delete para invalidar cache
   */
  async delete(id: number): Promise<boolean> {
    const result = await super.delete(id);
    await this.cacheService.delete('consultorias:ativas');
    return result;
  }
}
