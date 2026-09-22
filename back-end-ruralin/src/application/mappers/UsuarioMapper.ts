/**
 * UsuarioMapper - Mapper para entidade Usuario
 * 
 * Responsável por converter entre DTOs e entidades do domínio para Usuario.
 * 
 * Regras importantes:
 * - NUNCA incluir senha no DTO de resposta
 * - Aplicar hash de senha no toEntity se fornecida
 * - Tratar campos opcionais corretamente
 * 
 * @example
 * ```typescript
 * const mapper = new UsuarioMapper();
 * 
 * // Converter DTO para entidade
 * const entity = mapper.toEntity(createDto);
 * 
 * // Converter entidade para DTO
 * const dto = mapper.toDto(usuario);
 * ```
 */

import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import Usuario from '../../models/Usuario';
import { CreateUsuarioDto } from '../dto/usuario/CreateUsuarioDto';
import { UpdateUsuarioDto } from '../dto/usuario/UpdateUsuarioDto';
import { UsuarioResponseDto } from '../dto/usuario/UsuarioResponseDto';
import bcrypt from 'bcryptjs';

/**
 * Mapper para entidade Usuario
 * 
 * Implementa conversão entre DTOs e entidades, garantindo que:
 * - Senha nunca seja exposta em DTOs
 * - Senha seja hasheada ao converter de DTO para entidade
 * - Campos opcionais sejam tratados corretamente
 */
@Injectable()
export class UsuarioMapper implements IMapper<Usuario, UsuarioResponseDto, CreateUsuarioDto, UpdateUsuarioDto> {
  /**
   * Converte DTO para entidade do domínio
   * 
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreateUsuarioDto | UpdateUsuarioDto): Promise<Partial<Usuario>> {
    const entity: any = {};

    // Campos básicos
    if ('nome' in dto && dto.nome !== undefined) entity.nome = dto.nome;
    if ('username' in dto && dto.username !== undefined) entity.username = dto.username;
    if ('email' in dto && dto.email !== undefined) entity.email = dto.email;
    if ('whatsapp' in dto && dto.whatsapp !== undefined) entity.whatsapp = dto.whatsapp;
    if ('tipo' in dto && dto.tipo !== undefined) entity.tipo = dto.tipo;
    if ('apiKey' in dto && dto.apiKey !== undefined) entity.apiKey = dto.apiKey;
    if ('apiUrl' in dto && dto.apiUrl !== undefined) entity.apiUrl = dto.apiUrl;

    // Senha: aplicar hash se fornecida
    if ('senha' in dto && dto.senha) {
      entity.senha = await bcrypt.hash(dto.senha, 10);
    }

    return entity;
  }

  /**
   * Converte entidade do domínio para DTO
   * 
   * IMPORTANTE: NUNCA incluir senha no DTO de resposta!
   * 
   * @param entity - Entidade do domínio
   * @returns DTO de resposta (sem dados sensíveis)
   */
  toDto(entity: Usuario): UsuarioResponseDto {
    return {
      id: entity.id,
      nome: entity.nome,
      username: entity.username,
      email: entity.email,
      whatsapp: entity.whatsapp,
      tipo: entity.tipo as any,
      apiKey: entity.apiKey,
      apiUrl: entity.apiUrl,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      // NUNCA incluir senha!
    };
  }
}
