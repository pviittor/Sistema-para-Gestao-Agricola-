import { IApplicationService } from '../IApplicationService';
import { CreateGrupoProdutoDto } from '../../dto/grupoProduto/CreateGrupoProdutoDto';
import { UpdateGrupoProdutoDto } from '../../dto/grupoProduto/UpdateGrupoProdutoDto';
import { GrupoProdutoResponseDto } from '../../dto/grupoProduto/GrupoProdutoResponseDto';

/**
 * Interface para Application Service de GrupoProduto
 * 
 * Define os métodos disponíveis para operações de negócio com grupo de produto.
 */
export interface IGrupoProdutoApplicationService extends IApplicationService<GrupoProdutoResponseDto, CreateGrupoProdutoDto, UpdateGrupoProdutoDto> {
  // TODO: Adicionar métodos customizados se necessário
}
