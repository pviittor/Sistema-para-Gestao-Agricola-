import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import UnidadeMedida from '../../models/UnidadeMedida';
import { CreateUnidadeMedidaDto } from '../dto/unidadeMedida/CreateUnidadeMedidaDto';
import { UpdateUnidadeMedidaDto } from '../dto/unidadeMedida/UpdateUnidadeMedidaDto';
import { UnidadeMedidaResponseDto } from '../dto/unidadeMedida/UnidadeMedidaResponseDto';

/**
 * Mapper para entidade UnidadeMedida
 * 
 * Implementa conversão entre DTOs e entidades, garantindo que:
 * - Campos opcionais sejam tratados corretamente
 * - Campos de auditoria sejam preenchidos automaticamente
 */
@Injectable()
export class UnidadeMedidaMapper implements IMapper<UnidadeMedida, UnidadeMedidaResponseDto, CreateUnidadeMedidaDto, UpdateUnidadeMedidaDto> {
  /**
   * Converte DTO para entidade do domínio
   * 
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreateUnidadeMedidaDto | UpdateUnidadeMedidaDto): Promise<Partial<UnidadeMedida>> {
    const entity: any = {};

    if ('descricao_unidade' in dto && dto.descricao_unidade !== undefined) {
      entity.descricao_unidade = dto.descricao_unidade;
    }
    if ('abreviatura_unidade' in dto && dto.abreviatura_unidade !== undefined) {
      entity.abreviatura_unidade = dto.abreviatura_unidade;
    }

    return entity;
  }

  /**
   * Converte entidade para DTO de resposta
   * 
   * @param entity - Entidade do domínio
   * @returns DTO de resposta
   */
  toDto(entity: UnidadeMedida): UnidadeMedidaResponseDto {
    const dto: UnidadeMedidaResponseDto = {
      id_unidade: entity.id_unidade,
      tenantId: entity.tenantId,
      descricao_unidade: entity.descricao_unidade,
      abreviatura_unidade: entity.abreviatura_unidade,
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
