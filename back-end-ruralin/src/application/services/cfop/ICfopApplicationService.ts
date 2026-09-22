import { IApplicationService } from '../IApplicationService';
import { CreateCfopDto } from '../../dto/cfop/CreateCfopDto';
import { UpdateCfopDto } from '../../dto/cfop/UpdateCfopDto';
import { CfopResponseDto } from '../../dto/cfop/CfopResponseDto';

/**
 * Interface para Application Service de Cfop
 *
 * Define os métodos disponíveis para operações de negócio com CFOP.
 */
export interface ICfopApplicationService extends IApplicationService<CfopResponseDto, CreateCfopDto, UpdateCfopDto> {
  /**
   * Busca um CFOP pelo código
   */
  findByCodigo(codigo: string): Promise<CfopResponseDto | null>;

  /**
   * Lista todos os CFOPs ativos sem paginação
   */
  listAll(): Promise<CfopResponseDto[]>;
}
