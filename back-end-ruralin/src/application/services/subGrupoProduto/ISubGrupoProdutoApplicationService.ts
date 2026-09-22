import { IApplicationService } from '../IApplicationService';
import { CreateSubGrupoProdutoDto } from '../../dto/subGrupoProduto/CreateSubGrupoProdutoDto';
import { UpdateSubGrupoProdutoDto } from '../../dto/subGrupoProduto/UpdateSubGrupoProdutoDto';
import { SubGrupoProdutoResponseDto } from '../../dto/subGrupoProduto/SubGrupoProdutoResponseDto';

/**
 * Interface para Application Service de SubGrupoProduto
 * 
 * Define os métodos disponíveis para operações de negócio com subgrupo de produto.
 */
export interface ISubGrupoProdutoApplicationService extends IApplicationService<SubGrupoProdutoResponseDto, CreateSubGrupoProdutoDto, UpdateSubGrupoProdutoDto> {
  /**
   * Busca todos os subgrupos de um grupo de produto específico
   * 
   * @param idGrupo - ID do grupo de produto
   * @returns Promise que resolve com array de subgrupos do grupo especificado
   */
  findByGrupo(idGrupo: number): Promise<SubGrupoProdutoResponseDto[]>;
}
