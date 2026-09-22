/**
 * AuthorizationService - Serviço de Autorização
 * 
 * Serviço centralizado para verificação de permissões e roles de usuários.
 * Integra com o sistema de permissões existente (Role, Permissao, UsuarioHasRole, RoleHasPermissao)
 * para determinar se um usuário tem acesso a recursos específicos.
 * 
 * @example
 * ```typescript
 * const authService = container.resolve<IAuthorizationService>(TYPES.IAuthorizationService);
 * 
 * const canCreate = await authService.hasPermission(userId, 'usuario.create');
 * if (!canCreate) {
 *   throw new ForbiddenException('Permissão necessária');
 * }
 * ```
 */

import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { IAuthorizationService } from '../../core/authorization/IAuthorizationService';
import { ICacheService } from '../../core/cache/ICacheService';
import { IUsuarioRepository } from '../../infrastructure/repository/IUsuarioRepository';
import { IRoleRepository } from '../../infrastructure/repository/IRoleRepository';
import { IPermissaoRepository } from '../../infrastructure/repository/IPermissaoRepository';
import UsuarioHasRole from '../../models/UsuarioHasRole';
import RoleHasPermissao from '../../models/RoleHasPermissao';
import Permissao from '../../models/Permissao';
import Role from '../../models/Role';
import { Op } from 'sequelize';

/**
 * Serviço de Autorização
 * 
 * Implementa IAuthorizationService para verificação de permissões e roles.
 * Busca roles do usuário através de UsuarioHasRole e permissões das roles
 * através de RoleHasPermissao.
 */
/**
 * Configurações de cache
 */
const CACHE_CONFIG = {
  // TTL padrão para cache de permissões (1 hora)
  PERMISSION_TTL: 60,
  // TTL padrão para cache de roles (1 hora)
  ROLE_TTL: 60,
  // Prefixos para chaves de cache
  PERMISSION_KEY_PREFIX: 'auth:permission:',
  ROLE_KEY_PREFIX: 'auth:role:',
  USER_PERMISSIONS_KEY_PREFIX: 'auth:user:permissions:',
  USER_ROLES_KEY_PREFIX: 'auth:user:roles:',
};

@Injectable()
export class AuthorizationService implements IAuthorizationService {
  constructor(
    @Inject(TYPES.IUsuarioRepository) private usuarioRepository: IUsuarioRepository,
    @Inject(TYPES.IRoleRepository) private roleRepository: IRoleRepository,
    @Inject(TYPES.IPermissaoRepository) private permissaoRepository: IPermissaoRepository,
    @Inject(TYPES.ICacheService) private cacheService: ICacheService
  ) {}

  /**
   * Verifica se o usuário tem uma permissão específica
   * 
   * Busca todas as roles do usuário e verifica se alguma delas
   * possui a permissão especificada. Usa cache para otimizar performance.
   * 
   * @param userId - ID do usuário
   * @param permission - Nome da permissão (ex: 'usuario.create')
   * @returns Promise que resolve com true se o usuário tem a permissão, false caso contrário
   * 
   * @example
   * ```typescript
   * const hasPermission = await authService.hasPermission(userId, 'usuario.create');
   * ```
   */
  async hasPermission(userId: number, permission: string): Promise<boolean> {
    // Chave de cache: auth:permission:userId:permission
    const cacheKey = `${CACHE_CONFIG.PERMISSION_KEY_PREFIX}${userId}:${permission}`;

    // Tentar obter do cache
    const cached = await this.cacheService.get<boolean>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Verificar se usuário existe
    const usuario = await this.usuarioRepository.findById(userId);
    if (!usuario) {
      await this.cacheService.set(cacheKey, false, CACHE_CONFIG.PERMISSION_TTL);
      return false;
    }

    // Buscar permissão por nome (com cache)
    const permissao = await this.getPermissaoFromCache(permission);
    if (!permissao) {
      await this.cacheService.set(cacheKey, false, CACHE_CONFIG.PERMISSION_TTL);
      return false;
    }

    // Buscar roles do usuário (com cache)
    const roleIds = await this.getUserRoleIds(userId);
    if (roleIds.length === 0) {
      await this.cacheService.set(cacheKey, false, CACHE_CONFIG.PERMISSION_TTL);
      return false;
    }

    // Query otimizada: usar join para buscar permissões das roles em uma única query
    const rolePermissoes = await RoleHasPermissao.findOne({
      where: {
        roleId: { [Op.in]: roleIds },
        permissaoId: permissao.id
      }
    });

    const hasPermission = rolePermissoes !== null;

    // Armazenar no cache
    await this.cacheService.set(cacheKey, hasPermission, CACHE_CONFIG.PERMISSION_TTL);

    return hasPermission;
  }

  /**
   * Busca permissão do cache ou do banco de dados
   */
  private async getPermissaoFromCache(nome: string): Promise<Permissao | null> {
    const cacheKey = `permissao:${nome}`;
    const cached = await this.cacheService.get<Permissao>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const permissao = await this.permissaoRepository.findByNome(nome);
    if (permissao) {
      // Cachear permissão por 24 horas (permissoes raramente mudam)
      await this.cacheService.set(cacheKey, permissao, 86400);
    }

    return permissao;
  }

  /**
   * Busca IDs das roles do usuário do cache ou do banco de dados
   */
  private async getUserRoleIds(userId: number): Promise<number[]> {
    const cacheKey = `${CACHE_CONFIG.USER_ROLES_KEY_PREFIX}${userId}`;
    const cached = await this.cacheService.get<number[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const usuarioRoles = await UsuarioHasRole.findAll({
      where: { usuarioId: userId },
      attributes: ['roleId']
    });

    const roleIds = usuarioRoles.map(ur => ur.roleId);

    // Armazenar no cache
    await this.cacheService.set(cacheKey, roleIds, CACHE_CONFIG.ROLE_TTL);

    return roleIds;
  }

  /**
   * Verifica se o usuário tem uma role específica
   * 
   * @param userId - ID do usuário
   * @param role - Nome da role (ex: 'ADMIN')
   * @returns Promise que resolve com true se o usuário tem a role, false caso contrário
   * 
   * @example
   * ```typescript
   * const isAdmin = await authService.hasRole(userId, 'ADMIN');
   * ```
   */
  async hasRole(userId: number, role: string): Promise<boolean> {
    // Chave de cache: auth:role:userId:role
    const cacheKey = `${CACHE_CONFIG.ROLE_KEY_PREFIX}${userId}:${role}`;

    // Tentar obter do cache
    const cached = await this.cacheService.get<boolean>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Verificar se usuário existe
    const usuario = await this.usuarioRepository.findById(userId);
    if (!usuario) {
      await this.cacheService.set(cacheKey, false, CACHE_CONFIG.ROLE_TTL);
      return false;
    }

    // Buscar role por nome (com cache)
    const roleEntity = await this.getRoleFromCache(role);
    if (!roleEntity) {
      await this.cacheService.set(cacheKey, false, CACHE_CONFIG.ROLE_TTL);
      return false;
    }

    // Verificar se usuário tem a role (usar cache de roles do usuário)
    const roleIds = await this.getUserRoleIds(userId);
    const hasRole = roleIds.includes(roleEntity.id);

    // Armazenar no cache
    await this.cacheService.set(cacheKey, hasRole, CACHE_CONFIG.ROLE_TTL);

    return hasRole;
  }

  /**
   * Busca role do cache ou do banco de dados
   */
  private async getRoleFromCache(nome: string): Promise<Role | null> {
    const cacheKey = `role:${nome}`;
    const cached = await this.cacheService.get<Role>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const role = await this.roleRepository.findByNome(nome);
    if (role) {
      // Cachear role por 24 horas (roles raramente mudam)
      await this.cacheService.set(cacheKey, role, 86400);
    }

    return role;
  }

  /**
   * Verifica se o usuário tem pelo menos uma das roles especificadas (OR)
   * 
   * @param userId - ID do usuário
   * @param roles - Array de nomes de roles
   * @returns Promise que resolve com true se o usuário tem pelo menos uma das roles, false caso contrário
   * 
   * @example
   * ```typescript
   * const hasRole = await authService.hasAnyRole(userId, ['ADMIN', 'MANAGER']);
   * ```
   */
  async hasAnyRole(userId: number, roles: string[]): Promise<boolean> {
    if (roles.length === 0) {
      return false;
    }

    // Verificar se usuário existe
    // Usar findByIdWithoutTenant se disponível (método opcional na interface)
    // Caso contrário, usar findById (que requer tenant)
    const usuario = this.usuarioRepository.findByIdWithoutTenant
      ? await this.usuarioRepository.findByIdWithoutTenant(userId)
      : await this.usuarioRepository.findById(userId);
    if (!usuario) {
      return false;
    }

    // Buscar IDs das roles do usuário (com cache)
    const userRoleIds = await this.getUserRoleIds(userId);
    if (userRoleIds.length === 0) {
      return false;
    }

    // Buscar roles por nomes (com cache)
    const roleEntities = await Promise.all(
      roles.map(role => this.getRoleFromCache(role))
    );

    const validRoles = roleEntities.filter(r => r !== null) as Role[];
    if (validRoles.length === 0) {
      return false;
    }

    const roleIds = validRoles.map(r => r.id);

    // Verificar se usuário tem pelo menos uma das roles
    return roleIds.some(roleId => userRoleIds.includes(roleId));
  }

  /**
   * Verifica se o usuário tem todas as roles especificadas (AND)
   * 
   * @param userId - ID do usuário
   * @param roles - Array de nomes de roles
   * @returns Promise que resolve com true se o usuário tem todas as roles, false caso contrário
   * 
   * @example
   * ```typescript
   * const hasAllRoles = await authService.hasAllRoles(userId, ['ADMIN', 'MANAGER']);
   * ```
   */
  async hasAllRoles(userId: number, roles: string[]): Promise<boolean> {
    if (roles.length === 0) {
      return true; // Se não há roles para verificar, retorna true
    }

    // Verificar se usuário existe
    const usuario = await this.usuarioRepository.findById(userId);
    if (!usuario) {
      return false;
    }

    // Buscar IDs das roles do usuário (com cache)
    const userRoleIds = await this.getUserRoleIds(userId);

    // Buscar roles por nomes (com cache)
    const roleEntities = await Promise.all(
      roles.map(role => this.getRoleFromCache(role))
    );

    // Se alguma role não existe, retorna false
    if (roleEntities.some(r => r === null)) {
      return false;
    }

    const roleIds = (roleEntities.filter(r => r !== null) as Role[]).map(r => r.id);

    // Verificar se usuário tem todas as roles
    return roleIds.every(roleId => userRoleIds.includes(roleId));
  }

  /**
   * Invalida cache de autorização para um usuário
   * 
   * Deve ser chamado quando roles ou permissões do usuário mudarem.
   * 
   * @param userId - ID do usuário
   */
  async invalidateUserCache(userId: number): Promise<void> {
    // Remover todas as entradas de cache relacionadas ao usuário
    await this.cacheService.deleteByPattern(`${CACHE_CONFIG.PERMISSION_KEY_PREFIX}${userId}:*`);
    await this.cacheService.deleteByPattern(`${CACHE_CONFIG.ROLE_KEY_PREFIX}${userId}:*`);
    await this.cacheService.delete(`${CACHE_CONFIG.USER_ROLES_KEY_PREFIX}${userId}`);
    await this.cacheService.delete(`${CACHE_CONFIG.USER_PERMISSIONS_KEY_PREFIX}${userId}`);
  }

  /**
   * Invalida cache de uma permissão específica
   * 
   * Deve ser chamado quando uma permissão for modificada.
   * 
   * @param permissionName - Nome da permissão
   */
  async invalidatePermissionCache(permissionName: string): Promise<void> {
    // Remover cache da permissão
    await this.cacheService.delete(`permissao:${permissionName}`);
    // Remover todas as entradas de cache de permissões que usam esta permissão
    await this.cacheService.deleteByPattern(`${CACHE_CONFIG.PERMISSION_KEY_PREFIX}*:${permissionName}`);
  }

  /**
   * Invalida cache de uma role específica
   * 
   * Deve ser chamado quando uma role for modificada.
   * 
   * @param roleName - Nome da role
   */
  async invalidateRoleCache(roleName: string): Promise<void> {
    // Remover cache da role
    await this.cacheService.delete(`role:${roleName}`);
    // Remover todas as entradas de cache de roles que usam esta role
    await this.cacheService.deleteByPattern(`${CACHE_CONFIG.ROLE_KEY_PREFIX}*:${roleName}`);
  }

  /**
   * Invalida todo o cache de autorização
   * 
   * Útil para limpeza completa ou em caso de mudanças significativas.
   */
  async invalidateAllCache(): Promise<void> {
    await this.cacheService.deleteByPattern(`${CACHE_CONFIG.PERMISSION_KEY_PREFIX}*`);
    await this.cacheService.deleteByPattern(`${CACHE_CONFIG.ROLE_KEY_PREFIX}*`);
    await this.cacheService.deleteByPattern(`${CACHE_CONFIG.USER_ROLES_KEY_PREFIX}*`);
    await this.cacheService.deleteByPattern(`${CACHE_CONFIG.USER_PERMISSIONS_KEY_PREFIX}*`);
    await this.cacheService.deleteByPattern('permissao:*');
    await this.cacheService.deleteByPattern('role:*');
  }

  /**
   * Verifica se o usuário é do tipo GOD (bypass de permissões)
   * 
   * @param userId - ID do usuário
   * @returns Promise que resolve com true se o usuário é GOD, false caso contrário
   */
  async isGod(userId: number): Promise<boolean> {
    const usuario = this.usuarioRepository.findByIdWithoutTenant
      ? await this.usuarioRepository.findByIdWithoutTenant(userId)
      : await this.usuarioRepository.findById(userId);
    
    return usuario?.tipo === 'GOD';
  }

  /**
   * Verifica se o usuário é do tipo CONSULTOR
   * 
   * @param userId - ID do usuário
   * @returns Promise que resolve com true se o usuário é CONSULTOR, false caso contrário
   */
  async isConsultor(userId: number): Promise<boolean> {
    const usuario = this.usuarioRepository.findByIdWithoutTenant
      ? await this.usuarioRepository.findByIdWithoutTenant(userId)
      : await this.usuarioRepository.findById(userId);
    
    return usuario?.tipo === 'CONSULTOR';
  }

  /**
   * Verifica se o usuário pode acessar um tenant específico
   * 
   * @param userId - ID do usuário
   * @param tenantId - ID do tenant
   * @returns Promise que resolve com true se pode acessar, false caso contrário
   */
  async canAccessTenant(userId: number, tenantId: number): Promise<boolean> {
    const usuario = this.usuarioRepository.findByIdWithoutTenant
      ? await this.usuarioRepository.findByIdWithoutTenant(userId)
      : await this.usuarioRepository.findById(userId);
    
    if (!usuario) {
      return false;
    }

    // GOD pode acessar todos os tenants
    if (usuario.tipo === 'GOD') {
      return true;
    }

    // CONSULTOR pode acessar tenants da sua consultoria
    if (usuario.tipo === 'CONSULTOR') {
      if (!usuario.consultoriaId) {
        return false;
      }
      
      // Buscar tenant para verificar consultoriaId
      const Tenant = require('../../models/Tenant').default;
      const tenant = await Tenant.findByPk(tenantId, {
        attributes: ['id', 'consultoriaId'],
      });
      
      return tenant?.consultoriaId === usuario.consultoriaId;
    }

    // ROOT/CLIENT pode acessar apenas seu tenant
    if (usuario.tipo === 'ROOT' || usuario.tipo === 'CLIENT') {
      return usuario.tenantId === tenantId;
    }

    return false;
  }

  /**
   * Verifica se o usuário pode acessar uma consultoria específica
   * 
   * @param userId - ID do usuário
   * @param consultoriaId - ID da consultoria
   * @returns Promise que resolve com true se pode acessar, false caso contrário
   */
  async canAccessConsultoria(userId: number, consultoriaId: number): Promise<boolean> {
    const usuario = this.usuarioRepository.findByIdWithoutTenant
      ? await this.usuarioRepository.findByIdWithoutTenant(userId)
      : await this.usuarioRepository.findById(userId);
    
    if (!usuario) {
      return false;
    }

    // GOD pode acessar todas as consultorias
    if (usuario.tipo === 'GOD') {
      return true;
    }

    // CONSULTOR pode acessar apenas sua consultoria
    if (usuario.tipo === 'CONSULTOR') {
      return usuario.consultoriaId === consultoriaId;
    }

    // ROOT/CLIENT não podem acessar consultorias diretamente
    return false;
  }
}
