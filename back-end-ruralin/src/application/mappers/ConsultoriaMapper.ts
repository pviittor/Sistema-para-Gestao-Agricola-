/**
 * ConsultoriaMapper - Mapper para entidade Consultoria
 * 
 * Responsável por converter entre DTOs e entidades do domínio para Consultoria.
 */

import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import Consultoria from '../../models/Consultoria';
import { CreateConsultoriaDto } from '../dto/consultoria/CreateConsultoriaDto';
import { UpdateConsultoriaDto } from '../dto/consultoria/UpdateConsultoriaDto';
import { ConsultoriaResponseDto } from '../dto/consultoria/ConsultoriaResponseDto';

/**
 * Mapper para entidade Consultoria
 * 
 * Implementa conversão entre DTOs e entidades.
 */
@Injectable()
export class ConsultoriaMapper implements IMapper<Consultoria, ConsultoriaResponseDto, CreateConsultoriaDto, UpdateConsultoriaDto> {
  /**
   * Converte DTO para entidade do domínio
   * 
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreateConsultoriaDto | UpdateConsultoriaDto): Promise<Partial<Consultoria>> {
    const entity: any = {};

    if ('razaoSocial' in dto && dto.razaoSocial !== undefined) entity.razaoSocial = dto.razaoSocial;
    if ('nomeFantasia' in dto && dto.nomeFantasia !== undefined) entity.nomeFantasia = dto.nomeFantasia;
    if ('cnpj' in dto && dto.cnpj !== undefined) {
      // Remover formatação do CNPJ
      entity.cnpj = dto.cnpj.replace(/[.\-\/]/g, '');
    }
    if ('email' in dto && dto.email !== undefined) entity.email = dto.email;
    if ('telefone' in dto && dto.telefone !== undefined) entity.telefone = dto.telefone;
    if ('limiteTenants' in dto && dto.limiteTenants !== undefined) entity.limiteTenants = dto.limiteTenants;

    return entity;
  }

  /**
   * Converte entidade para DTO de resposta
   * 
   * @param entity - Entidade do domínio
   * @returns DTO de resposta
   */
  toDto(entity: Consultoria): ConsultoriaResponseDto {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      razaoSocial: entity.razaoSocial,
      nomeFantasia: entity.nomeFantasia,
      cnpj: entity.cnpj,
      email: entity.email,
      telefone: entity.telefone,
      ativo: entity.ativo,
      dataAtivacao: entity.dataAtivacao,
      dataDesativacao: entity.dataDesativacao,
      limiteTenants: entity.limiteTenants,
      tenantCount: entity.tenantCount,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
