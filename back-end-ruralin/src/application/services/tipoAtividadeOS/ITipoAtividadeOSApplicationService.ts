import { IApplicationService } from '../IApplicationService';
import { CreateTipoAtividadeOSDto } from '../../dto/tipoAtividadeOS/CreateTipoAtividadeOSDto';
import { CreateTipoAtividadeOSCompletoDto } from '../../dto/tipoAtividadeOS/CreateTipoAtividadeOSCompletoDto';
import { UpdateTipoAtividadeOSDto } from '../../dto/tipoAtividadeOS/UpdateTipoAtividadeOSDto';
import { TipoAtividadeOSResponseDto } from '../../dto/tipoAtividadeOS/TipoAtividadeOSResponseDto';
import { PaginatedResult } from '../../../core/repository/types';

/**
 * Interface para Application Service de TipoAtividadeOS
 *
 * Define os métodos disponíveis para operações de negócio com tipos de atividade de OS,
 * incluindo o padrão master-detail com CamposCondicionais.
 */
export interface ITipoAtividadeOSApplicationService
  extends IApplicationService<TipoAtividadeOSResponseDto, CreateTipoAtividadeOSDto, UpdateTipoAtividadeOSDto> {
  /**
   * Lista todos os tipos de atividade sem paginação (para selects/combos)
   */
  listAll(): Promise<TipoAtividadeOSResponseDto[]>;

  /**
   * Cria um tipo de atividade completo com campos condicionais em uma única transação
   */
  createCompleto(dto: CreateTipoAtividadeOSCompletoDto): Promise<TipoAtividadeOSResponseDto>;

  /**
   * Atualiza um tipo de atividade completo com campos condicionais (delete-and-recreate)
   */
  updateCompleto(id: number, dto: UpdateTipoAtividadeOSDto & { camposCondicionais?: any[] }): Promise<TipoAtividadeOSResponseDto>;
}
