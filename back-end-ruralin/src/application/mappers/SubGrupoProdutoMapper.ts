import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import SubGrupoProduto from '../../models/SubGrupoProduto';
import { CreateSubGrupoProdutoDto } from '../dto/subGrupoProduto/CreateSubGrupoProdutoDto';
import { UpdateSubGrupoProdutoDto } from '../dto/subGrupoProduto/UpdateSubGrupoProdutoDto';
import { SubGrupoProdutoResponseDto } from '../dto/subGrupoProduto/SubGrupoProdutoResponseDto';

/**
 * Mapper para entidade SubGrupoProduto
 * 
 * Implementa conversão entre DTOs e entidades, garantindo que:
 * - Campos opcionais sejam tratados corretamente
 */
@Injectable()
export class SubGrupoProdutoMapper implements IMapper<SubGrupoProduto, SubGrupoProdutoResponseDto, CreateSubGrupoProdutoDto, UpdateSubGrupoProdutoDto> {
  /**
   * Converte DTO para entidade do domínio
   * 
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreateSubGrupoProdutoDto | UpdateSubGrupoProdutoDto): Promise<Partial<SubGrupoProduto>> {
    const entity: any = {};

    if ('descricao_sub' in dto && dto.descricao_sub !== undefined) {
      entity.descricao_sub = dto.descricao_sub;
    }
    if ('idGrupo' in dto && dto.idGrupo !== undefined) {
      entity.idGrupo = dto.idGrupo;
    }

    return entity;
  }

  /**
   * Converte entidade para DTO de resposta
   * 
   * @param entity - Entidade do domínio
   * @returns DTO de resposta
   */
  toDto(entity: SubGrupoProduto): SubGrupoProdutoResponseDto {
    const dto: SubGrupoProdutoResponseDto = {
      id_sub: entity.id_sub,
      tenantId: entity.tenantId,
      descricao_sub: entity.descricao_sub,
      idGrupo: entity.idGrupo,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    // Incluir grupo se estiver carregado
    if ((entity as any).grupo) {
      dto.grupo = {
        id: (entity as any).grupo.id,
        descricao_grupo: (entity as any).grupo.descricao_grupo,
        abreviacao_grupo: (entity as any).grupo.abreviacao_grupo,
      };
    }

    return dto;
  }
}
