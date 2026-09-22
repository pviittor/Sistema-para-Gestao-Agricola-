/**
 * TenantMapper - Mapper para entidade Tenant
 * 
 * Responsável por converter entre DTOs e entidades do domínio para Tenant.
 */

import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import Tenant from '../../models/Tenant';
import { CreateTenantDto } from '../dto/tenant/CreateTenantDto';
import { UpdateTenantDto } from '../dto/tenant/UpdateTenantDto';
import { TenantResponseDto } from '../dto/tenant/TenantResponseDto';

/**
 * Mapper para entidade Tenant
 * 
 * Implementa conversão entre DTOs e entidades.
 */
@Injectable()
export class TenantMapper implements IMapper<Tenant, TenantResponseDto, CreateTenantDto, UpdateTenantDto> {
  /**
   * Converte DTO para entidade do domínio
   * 
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreateTenantDto | UpdateTenantDto): Promise<Partial<Tenant>> {
    const entity: any = {};

    if ('nome' in dto && dto.nome !== undefined) entity.nome = dto.nome;
    if ('slug' in dto && dto.slug !== undefined) {
      // Normalizar slug para lowercase
      entity.slug = dto.slug.toLowerCase();
    }
    if ('configuracoes' in dto && dto.configuracoes !== undefined) entity.configuracoes = dto.configuracoes;
    if ('limiteUsuarios' in dto && dto.limiteUsuarios !== undefined) entity.limiteUsuarios = dto.limiteUsuarios;

    return entity;
  }

  /**
   * Converte entidade para DTO de resposta
   * 
   * @param entity - Entidade do domínio
   * @returns DTO de resposta
   */
  toDto(entity: Tenant): TenantResponseDto {
    return {
      id: entity.id,
      consultoriaId: entity.consultoriaId,
      nome: entity.nome,
      slug: entity.slug,
      ativo: entity.ativo,
      dataAtivacao: entity.dataAtivacao,
      dataDesativacao: entity.dataDesativacao,
      configuracoes: entity.configuracoes,
      limiteUsuarios: entity.limiteUsuarios,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
