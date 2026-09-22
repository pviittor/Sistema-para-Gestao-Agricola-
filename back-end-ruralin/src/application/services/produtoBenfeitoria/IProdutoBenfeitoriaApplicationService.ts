import { IApplicationService } from '../IApplicationService';
import { CreateProdutoBenfeitoriaDto } from '../../dto/produtoBenfeitoria/CreateProdutoBenfeitoriaDto';
import { UpdateProdutoBenfeitoriaDto } from '../../dto/produtoBenfeitoria/UpdateProdutoBenfeitoriaDto';
import { ProdutoBenfeitoriaResponseDto } from '../../dto/produtoBenfeitoria/ProdutoBenfeitoriaResponseDto';

/**
 * Interface para Application Service de ProdutoBenfeitoria
 */
export interface IProdutoBenfeitoriaApplicationService extends IApplicationService<ProdutoBenfeitoriaResponseDto, CreateProdutoBenfeitoriaDto, UpdateProdutoBenfeitoriaDto> {}
