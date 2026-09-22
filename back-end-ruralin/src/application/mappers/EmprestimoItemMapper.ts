import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import EmprestimoItem from '../../models/EmprestimoItem';
import { CreateEmprestimoItemDto } from '../dto/emprestimoItem/CreateEmprestimoItemDto';
import { UpdateEmprestimoItemDto } from '../dto/emprestimoItem/UpdateEmprestimoItemDto';
import { EmprestimoItemResponseDto } from '../dto/emprestimoItem/EmprestimoItemResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade EmprestimoItem
 *
 * Responsável por converter entre DTOs e entidades do domínio para EmprestimoItem.
 *
 * Regras importantes:
 * - Em toEntity, calcula total_empi = quantidade_empi × unitario_empi automaticamente
 * - Trata campos opcionais corretamente
 */
@Injectable()
export class EmprestimoItemMapper
  implements IMapper<EmprestimoItem, EmprestimoItemResponseDto, CreateEmprestimoItemDto, UpdateEmprestimoItemDto>
{
  /**
   * Converte DTO para entidade do domínio
   *
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade com total_empi calculado
   */
  async toEntity(dto: CreateEmprestimoItemDto | UpdateEmprestimoItemDto): Promise<Partial<EmprestimoItem>> {
    const entity: any = {};

    if ('emprestimoId' in dto && dto.emprestimoId !== undefined) entity.emprestimoId = dto.emprestimoId;
    if ('produtoId' in dto && dto.produtoId !== undefined) entity.produtoId = dto.produtoId;
    if ('quantidade_empi' in dto && dto.quantidade_empi !== undefined) entity.quantidade_empi = dto.quantidade_empi;
    if ('unitario_empi' in dto && dto.unitario_empi !== undefined) entity.unitario_empi = dto.unitario_empi;

    // Calcular total_empi automaticamente quando ambos os campos estiverem presentes
    if (entity.quantidade_empi !== undefined && entity.unitario_empi !== undefined) {
      entity.total_empi = Number((entity.quantidade_empi * entity.unitario_empi).toFixed(2));
    }

    return entity;
  }

  /**
   * Converte entidade do domínio para DTO
   *
   * @param entity - Entidade do domínio
   * @returns DTO de resposta
   */
  toDto(entity: EmprestimoItem): EmprestimoItemResponseDto {
    const dto: any = {
      id: entity.id,
      emprestimoId: entity.emprestimoId,
      produtoId: entity.produtoId,
      quantidade_empi: Number(entity.quantidade_empi),
      unitario_empi: Number(entity.unitario_empi),
      total_empi: Number(entity.total_empi),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    // Incluir associação produto quando presente
    if ((entity as any).produto) {
      dto.produto = (entity as any).produto;
    }

    adicionarCamposFormatados(dto, ['unitario_empi', 'total_empi']);

    return dto;
  }
}
