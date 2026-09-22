import { IApplicationService } from '../IApplicationService';
import { CreateCulturaDto } from '../../dto/cultura/CreateCulturaDto';
import { UpdateCulturaDto } from '../../dto/cultura/UpdateCulturaDto';
import { CulturaResponseDto } from '../../dto/cultura/CulturaResponseDto';

/**
 * Interface para Application Service de Cultura
 */
export interface ICulturaApplicationService extends IApplicationService<CulturaResponseDto, CreateCulturaDto, UpdateCulturaDto> {
  /**
   * Busca todas as culturas de um produto específico
   */
  findByProduto(idProduto: number): Promise<CulturaResponseDto[]>;
}
