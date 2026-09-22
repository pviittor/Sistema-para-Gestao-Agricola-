import { IApplicationService } from '../IApplicationService';
import { CreateProdutoDto } from '../../dto/produto/CreateProdutoDto';
import { UpdateProdutoDto } from '../../dto/produto/UpdateProdutoDto';
import { ProdutoResponseDto } from '../../dto/produto/ProdutoResponseDto';

/**
 * Interface para Application Service de Produto
 */
export interface IProdutoApplicationService extends IApplicationService<ProdutoResponseDto, CreateProdutoDto, UpdateProdutoDto> {
  /**
   * Lista todos os produtos sem paginação (para selects/combos)
   */
  listAll(): Promise<ProdutoResponseDto[]>;

  /**
   * Busca todos os produtos de um grupo específico
   */
  findByGrupo(idGrupo: number): Promise<ProdutoResponseDto[]>;

  /**
   * Busca todos os produtos de um subgrupo específico
   */
  findBySubGrupo(idSubGrupo: number): Promise<ProdutoResponseDto[]>;
}
