/**
 * PermissaoMapper - Mapper para entidade Permissao
 * 
 * Responsável por converter entre DTOs e entidades do domínio para Permissao.
 * 
 * @example
 * ```typescript
 * const mapper = new PermissaoMapper();
 * 
 * // Converter DTO para entidade
 * const entity = await mapper.toEntity(createDto);
 * 
 * // Converter entidade para DTO
 * const dto = mapper.toDto(permissao);
 * ```
 */

import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import Permissao from '../../models/Permissao';
import { CreatePermissaoDto } from '../dto/permissao/CreatePermissaoDto';
import { UpdatePermissaoDto } from '../dto/permissao/UpdatePermissaoDto';
import { PermissaoResponseDto } from '../dto/permissao/PermissaoResponseDto';

/**
 * Mapper para entidade Permissao
 * 
 * Implementa conversão entre DTOs e entidades, garantindo que:
 * - Campos opcionais sejam tratados corretamente
 * - Dados sejam convertidos adequadamente
 */
@Injectable()
export class PermissaoMapper implements IMapper<Permissao, PermissaoResponseDto, CreatePermissaoDto, UpdatePermissaoDto> {
  /**
   * Converte DTO para entidade do domínio
   * 
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreatePermissaoDto | UpdatePermissaoDto): Promise<Partial<Permissao>> {
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
  toDto(entity: Permissao): PermissaoResponseDto {
    return {
      id: entity.id,
      nome: entity.nome,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
