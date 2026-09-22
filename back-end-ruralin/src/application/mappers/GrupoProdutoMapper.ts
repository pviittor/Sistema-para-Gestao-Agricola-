import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import GrupoProduto from '../../models/GrupoProduto';
import { CreateGrupoProdutoDto } from '../dto/grupoProduto/CreateGrupoProdutoDto';
import { UpdateGrupoProdutoDto } from '../dto/grupoProduto/UpdateGrupoProdutoDto';
import { GrupoProdutoResponseDto } from '../dto/grupoProduto/GrupoProdutoResponseDto';

/**
 * Mapper para entidade GrupoProduto
 * 
 * Implementa conversão entre DTOs e entidades, garantindo que:
 * - Campos opcionais sejam tratados corretamente
 */
@Injectable()
export class GrupoProdutoMapper implements IMapper<GrupoProduto, GrupoProdutoResponseDto, CreateGrupoProdutoDto, UpdateGrupoProdutoDto> {
  /**
   * Converte DTO para entidade do domínio
   * 
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreateGrupoProdutoDto | UpdateGrupoProdutoDto): Promise<Partial<GrupoProduto>> {
    const entity: any = {};

    if ('descricao_grupo' in dto && dto.descricao_grupo !== undefined) {
      entity.descricao_grupo = dto.descricao_grupo;
    }
    if ('abreviacao_grupo' in dto && dto.abreviacao_grupo !== undefined) {
      entity.abreviacao_grupo = dto.abreviacao_grupo;
    }

    return entity;
  }

  /**
   * Converte entidade para DTO de resposta
   * 
   * @param entity - Entidade do domínio
   * @returns DTO de resposta
   */
  toDto(entity: GrupoProduto): GrupoProdutoResponseDto {
    const dto: GrupoProdutoResponseDto = {
      id: entity.id,
      tenantId: entity.tenantId,
      descricao_grupo: entity.descricao_grupo,
      abreviacao_grupo: entity.abreviacao_grupo,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    return dto;
  }
}
