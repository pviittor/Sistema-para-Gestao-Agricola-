import { IApplicationService } from '../IApplicationService';
import { CreateApontamentoProdutoDto } from '../../dto/apontamentoProduto/CreateApontamentoProdutoDto';
import { UpdateApontamentoProdutoDto } from '../../dto/apontamentoProduto/UpdateApontamentoProdutoDto';
import { ApontamentoProdutoResponseDto } from '../../dto/apontamentoProduto/ApontamentoProdutoResponseDto';

/**
 * Interface para Application Service de ApontamentoProduto
 */
export interface IApontamentoProdutoApplicationService extends IApplicationService<ApontamentoProdutoResponseDto, CreateApontamentoProdutoDto, UpdateApontamentoProdutoDto> {}
