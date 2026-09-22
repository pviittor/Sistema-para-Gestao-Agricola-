import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import EmprestimoItemDevolucao from '../../models/EmprestimoItemDevolucao';
import { CreateEmprestimoItemDevolucaoDto } from '../dto/emprestimoItemDevolucao/CreateEmprestimoItemDevolucaoDto';
import { UpdateEmprestimoItemDevolucaoDto } from '../dto/emprestimoItemDevolucao/UpdateEmprestimoItemDevolucaoDto';
import { EmprestimoItemDevolucaoResponseDto } from '../dto/emprestimoItemDevolucao/EmprestimoItemDevolucaoResponseDto';

/**
 * Mapper para entidade EmprestimoItemDevolucao
 *
 * Responsável por converter entre DTOs e entidades do domínio para EmprestimoItemDevolucao.
 */
@Injectable()
export class EmprestimoItemDevolucaoMapper
  implements IMapper<
    EmprestimoItemDevolucao,
    EmprestimoItemDevolucaoResponseDto,
    CreateEmprestimoItemDevolucaoDto,
    UpdateEmprestimoItemDevolucaoDto
  >
{
  /**
   * Converte DTO para entidade do domínio
   *
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(
    dto: CreateEmprestimoItemDevolucaoDto | UpdateEmprestimoItemDevolucaoDto
  ): Promise<Partial<EmprestimoItemDevolucao>> {
    const entity: any = {};

    if ('itemDevolucaoId' in dto && dto.itemDevolucaoId !== undefined) entity.itemDevolucaoId = dto.itemDevolucaoId;
    if ('produtoDevolucaoId' in dto && dto.produtoDevolucaoId !== undefined) entity.produtoDevolucaoId = dto.produtoDevolucaoId;
    if ('produtoSimilarId' in dto) entity.produtoSimilarId = dto.produtoSimilarId ?? null;
    if ('datadevolucao_empdev' in dto && dto.datadevolucao_empdev !== undefined) entity.datadevolucao_empdev = dto.datadevolucao_empdev;
    if ('quantidadedevolvida_empdev' in dto && dto.quantidadedevolvida_empdev !== undefined) entity.quantidadedevolvida_empdev = dto.quantidadedevolvida_empdev;
    if ('devolucaoGeraFinanceiro_empdev' in dto && dto.devolucaoGeraFinanceiro_empdev !== undefined) entity.devolucaoGeraFinanceiro_empdev = dto.devolucaoGeraFinanceiro_empdev;
    if ('devolucaoProdutoSimilar_empdev' in dto && dto.devolucaoProdutoSimilar_empdev !== undefined) entity.devolucaoProdutoSimilar_empdev = dto.devolucaoProdutoSimilar_empdev;

    return entity;
  }

  /**
   * Converte entidade do domínio para DTO
   *
   * @param entity - Entidade do domínio
   * @returns DTO de resposta
   */
  toDto(entity: EmprestimoItemDevolucao): EmprestimoItemDevolucaoResponseDto {
    const dto: any = {
      id: entity.id,
      itemDevolucaoId: entity.itemDevolucaoId,
      produtoDevolucaoId: entity.produtoDevolucaoId,
      produtoSimilarId: entity.produtoSimilarId,
      datadevolucao_empdev: entity.datadevolucao_empdev,
      quantidadedevolvida_empdev: Number(entity.quantidadedevolvida_empdev),
      devolucaoGeraFinanceiro_empdev: entity.devolucaoGeraFinanceiro_empdev,
      devolucaoProdutoSimilar_empdev: entity.devolucaoProdutoSimilar_empdev,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    // Incluir associações quando presentes
    if ((entity as any).produtoDevolucao) {
      dto.produtoDevolucao = (entity as any).produtoDevolucao;
    }
    if ((entity as any).produtoSimilar) {
      dto.produtoSimilar = (entity as any).produtoSimilar;
    }

    return dto;
  }
}
