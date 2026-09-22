/**
 * RoleMapper - Mapper para entidade Role
 * 
 * Responsável por converter entre DTOs e entidades do domínio para Role.
 * 
 * @example
 * ```typescript
 * const mapper = new RoleMapper();
 * 
 * // Converter DTO para entidade
 * const entity = await mapper.toEntity(createDto);
 * 
 * // Converter entidade para DTO
 * const dto = mapper.toDto(role);
 * ```
 */

import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import Role from '../../models/Role';
import { CreateRoleDto } from '../dto/role/CreateRoleDto';
import { UpdateRoleDto } from '../dto/role/UpdateRoleDto';
import { RoleResponseDto } from '../dto/role/RoleResponseDto';

/**
 * Mapper para entidade Role
 * 
 * Implementa conversão entre DTOs e entidades, garantindo que:
 * - Campos opcionais sejam tratados corretamente
 * - Dados sejam convertidos adequadamente
 */
@Injectable()
export class RoleMapper implements IMapper<Role, RoleResponseDto, CreateRoleDto, UpdateRoleDto> {
  /**
   * Converte DTO para entidade do domínio
   * 
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreateRoleDto | UpdateRoleDto): Promise<Partial<Role>> {
    const entity: any = {};

    // Campos básicos
    if ('nome' in dto && dto.nome !== undefined) {
      entity.nome = dto.nome;
    }

    return entity;
  }

  /**
   * Converte entidade do domínio para DTO
   * 
   * @param entity - Entidade do domínio
   * @returns DTO de resposta
   */
  toDto(entity: Role): RoleResponseDto {
    return {
      id: entity.id,
      nome: entity.nome,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
