import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import PrincipioAtivo from '../../models/PrincipioAtivo';
import { CreatePrincipioAtivoDto } from '../dto/principioAtivo/CreatePrincipioAtivoDto';
import { UpdatePrincipioAtivoDto } from '../dto/principioAtivo/UpdatePrincipioAtivoDto';
import { PrincipioAtivoResponseDto } from '../dto/principioAtivo/PrincipioAtivoResponseDto';

/**
 * Mapper para entidade PrincipioAtivo
 * 
 * Implementa conversão entre DTOs e entidades, garantindo que:
 * - Campos opcionais sejam tratados corretamente
 * - Campos de auditoria sejam preenchidos automaticamente
 */
@Injectable()
export class PrincipioAtivoMapper implements IMapper<PrincipioAtivo, PrincipioAtivoResponseDto, CreatePrincipioAtivoDto, UpdatePrincipioAtivoDto> {
  /**
   * Converte DTO para entidade do domínio
   * 
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreatePrincipioAtivoDto | UpdatePrincipioAtivoDto): Promise<Partial<PrincipioAtivo>> {
    const entity: any = {};

    if ('descricao_principio' in dto && dto.descricao_principio !== undefined) {
      entity.descricao_principio = dto.descricao_principio;
    }
    if ('classe_principio' in dto && dto.classe_principio !== undefined) {
      entity.classe_principio = dto.classe_principio;
    }

    return entity;
  }

  /**
   * Converte entidade para DTO de resposta
   * 
   * @param entity - Entidade do domínio
   * @returns DTO de resposta
   */
  toDto(entity: PrincipioAtivo): PrincipioAtivoResponseDto {
    const dto: PrincipioAtivoResponseDto = {
      id_principio: entity.id_principio,
      tenantId: entity.tenantId,
      descricao_principio: entity.descricao_principio,
      classe_principio: entity.classe_principio,
      usercreation: entity.usercreation,
      datecreation: entity.datecreation,
    };

    // Incluir usuário criador se estiver carregado
    if ((entity as any).usuarioCriador) {
      dto.usuarioCriador = {
        id: (entity as any).usuarioCriador.id,
        nome: (entity as any).usuarioCriador.nome,
        email: (entity as any).usuarioCriador.email,
      };
    }

    return dto;
  }
}
