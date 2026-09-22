/**
 * PessoaRepository - Repositório para entidade Pessoa
 * 
 * Implementa IPessoaRepository estendendo BaseRepository e adiciona
 * métodos específicos para busca de pessoas por CPF/CNPJ, email, tipo, papel e usuário criador.
 * 
 * @example
 * ```typescript
 * import { PessoaRepository } from './PessoaRepository';
 * 
 * const repository = new PessoaRepository();
 * const pessoa = await repository.findByCpfCnpj('12345678901');
 * ```
 */

import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IPessoaRepository } from './IPessoaRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { NotFoundException, ForbiddenException } from '../../core/exceptions';
import Pessoa from '../../models/Pessoa';
import { Op } from 'sequelize';

/**
 * Repositório para entidade Pessoa
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca por CPF/CNPJ, email, tipo, papel e usuário criador.
 */
@Injectable()
export class PessoaRepository extends BaseRepository<Pessoa> implements IPessoaRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo Pessoa, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Pessoa, cacheService, tenantService);
  }

  /**
   * Busca pessoa por CPF ou CNPJ
   * 
   * Remove formatação (pontos, traços, barras) antes de buscar.
   * 
   * @param cpfcnpj - CPF ou CNPJ da pessoa (com ou sem formatação)
   * @returns Promise que resolve com a pessoa encontrada ou null
   */
  async findByCpfCnpj(cpfcnpj: string): Promise<Pessoa | null> {
    // Remover formatação (pontos, traços, barras, espaços)
    const cpfcnpjLimpo = cpfcnpj.replace(/[.\-\/ ]/g, '');
    
    const cacheKey = `pessoa:findByCpfCnpj:${cpfcnpjLimpo}`;
    
    // Verificar cache
    const cached = await this.cacheService.get<Pessoa>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const pessoa = await this.findOne({
      where: {
        cpfcnpj_pessoa: {
          [Op.like]: `%${cpfcnpjLimpo}%`,
        },
      },
    });

    if (pessoa) {
      await this.cacheService.set(cacheKey, pessoa, this.DEFAULT_CACHE_TTL);
    }

    return pessoa;
  }

  /**
   * Busca pessoa por email
   * 
   * @param email - Email da pessoa
   * @returns Promise que resolve com a pessoa encontrada ou null
   */
  async findByEmail(email: string): Promise<Pessoa | null> {
    const cacheKey = `pessoa:findByEmail:${email.toLowerCase()}`;
    
    // Verificar cache
    const cached = await this.cacheService.get<Pessoa>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const pessoa = await this.findOne({
      where: {
        email_pessoa: {
          [Op.iLike]: email,
        },
      },
    });

    if (pessoa) {
      await this.cacheService.set(cacheKey, pessoa, this.DEFAULT_CACHE_TTL);
    }

    return pessoa;
  }

  /**
   * Busca pessoas por tipo (Pessoa Física ou Pessoa Jurídica)
   * 
   * @param tipo - Tipo de pessoa: 1 = Pessoa Física (PF), 2 = Pessoa Jurídica (PJ)
   * @returns Promise que resolve com array de pessoas do tipo especificado
   */
  async findByTipo(tipo: number): Promise<Pessoa[]> {
    const cacheKey = `pessoa:findByTipo:${tipo}`;
    
    // Verificar cache
    const cached = await this.cacheService.get<Pessoa[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const pessoas = await this.findAll({
      where: {
        tipo_pessoa: tipo,
      },
      order: [['nomerazao_pessoa', 'ASC']],
    });

    if (pessoas.length > 0) {
      await this.cacheService.set(cacheKey, pessoas, this.DEFAULT_CACHE_TTL);
    }

    return pessoas;
  }

  /**
   * Busca pessoas criadas por um usuário específico
   * 
   * @param userId - ID do usuário que criou as pessoas
   * @returns Promise que resolve com array de pessoas criadas pelo usuário
   */
  async findByUserCreation(userId: number): Promise<Pessoa[]> {
    const cacheKey = `pessoa:findByUserCreation:${userId}`;
    
    // Verificar cache
    const cached = await this.cacheService.get<Pessoa[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const pessoas = await this.findAll({
      where: {
        usercreation: userId,
      },
      order: [['datecreation', 'DESC']],
    });

    if (pessoas.length > 0) {
      await this.cacheService.set(cacheKey, pessoas, this.DEFAULT_CACHE_TTL);
    }

    return pessoas;
  }

  /**
   * Busca pessoas por papel específico
   * 
   * @param papel - Papel da pessoa: 'cliente', 'produtor', 'portador', 'funcionario', 'fornecedor', 'motorista', 'operador'
   * @returns Promise que resolve com array de pessoas com o papel especificado
   */
  async findByPapel(papel: string): Promise<Pessoa[]> {
    const campoPapel = `${papel}_pessoa` as keyof Pessoa;
    
    // Validar que o papel existe
    const papeisValidos = ['cliente', 'produtor', 'portador', 'funcionario', 'fornecedor', 'motorista', 'operador'];
    if (!papeisValidos.includes(papel)) {
      return [];
    }

    const cacheKey = `pessoa:findByPapel:${papel}`;
    
    // Verificar cache
    const cached = await this.cacheService.get<Pessoa[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const pessoas = await this.findAll({
      where: {
        [campoPapel]: true,
      } as any,
      order: [['nomerazao_pessoa', 'ASC']],
    });

    if (pessoas.length > 0) {
      await this.cacheService.set(cacheKey, pessoas, this.DEFAULT_CACHE_TTL);
    }

    return pessoas;
  }

  /**
   * Sobrescreve findById para usar id_pessoa ao invés de id
   * 
   * @param id - ID da pessoa
   * @returns Promise que resolve com a pessoa encontrada ou null
   */
  async findById(id: number | string): Promise<Pessoa | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = this.getFindByIdCacheKey(id);

    // Verificar cache
    const cached = await this.cacheService.get<Pessoa>(cacheKey);
    if (cached !== null) {
      if (this.isEntityFromCurrentTenant(cached)) {
        return cached;
      }
      await this.cacheService.delete(cacheKey);
    }

    // Query no banco usando id_pessoa
    const result = await this.model.findOne({
      where: {
        id_pessoa: id,
        ...tenantFilter,
      } as any,
    });

    // Cachear resultado
    if (result) {
      await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    }

    return result;
  }

  /**
   * Sobrescreve update para usar id_pessoa ao invés de id
   * 
   * @param id - ID da pessoa
   * @param entity - Dados parciais a serem atualizados
   * @returns Promise que resolve com a pessoa atualizada
   */
  async update(id: number | string, entity: Partial<Pessoa>): Promise<Pessoa> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new ForbiddenException(
        'Tenant não identificado. Não é possível atualizar pessoa sem tenantId.',
        'TENANT_NOT_IDENTIFIED'
      );
    }

    // Buscar com filtro de tenant usando id_pessoa
    const instance = await this.model.findOne({
      where: {
        id_pessoa: id,
        ...tenantFilter,
      } as any,
    });
    
    if (!instance) {
      throw new NotFoundException('Pessoa', id);
    }
    
    // Garantir que tenantId não seja alterado
    const entityWithoutTenant = { ...entity };
    if ('tenantId' in entityWithoutTenant) {
      delete (entityWithoutTenant as any).tenantId;
    }
    
    await instance.update(entityWithoutTenant);
    
    // Invalidar cache
    await this.invalidateFindByIdCache(id);
    await this.invalidateFindAllCache();
    
    return instance;
  }

  /**
   * Sobrescreve delete para usar id_pessoa ao invés de id
   * 
   * @param id - ID da pessoa
   * @returns Promise que resolve com true se removido, false caso contrário
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new ForbiddenException(
        'Tenant não identificado. Não é possível deletar pessoa sem tenantId.',
        'TENANT_NOT_IDENTIFIED'
      );
    }

    // Buscar com filtro de tenant usando id_pessoa
    const instance = await this.model.findOne({
      where: {
        id_pessoa: id,
        ...tenantFilter,
      } as any,
    });
    
    if (!instance) {
      return false;
    }
    
    await instance.destroy();
    
    // Invalidar cache
    await this.invalidateFindByIdCache(id);
    await this.invalidateFindAllCache();
    
    return true;
  }

}
