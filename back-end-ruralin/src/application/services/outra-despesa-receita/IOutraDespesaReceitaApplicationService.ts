import { IApplicationService } from '../IApplicationService';
import { CreateOutraDespesaReceitaDto } from '../../dto/outraDespesaReceita/CreateOutraDespesaReceitaDto';
import { UpdateOutraDespesaReceitaDto } from '../../dto/outraDespesaReceita/UpdateOutraDespesaReceitaDto';
import { OutraDespesaReceitaResponseDto } from '../../dto/outraDespesaReceita/OutraDespesaReceitaResponseDto';

/**
 * Interface para Application Service de OutraDespesaReceita
 */
export interface IOutraDespesaReceitaApplicationService extends IApplicationService<OutraDespesaReceitaResponseDto, CreateOutraDespesaReceitaDto, UpdateOutraDespesaReceitaDto> {
  /**
   * Busca outras despesas/receitas por filtros combinados
   */
  findByFilters(
    planoGerencialId?: number,
    dataInicio?: string,
    dataFim?: string,
    configuradorCicloId?: number,
    cultura?: string
  ): Promise<OutraDespesaReceitaResponseDto[]>;

  /**
   * Busca outras despesas/receitas por cultura
   */
  findByCultura(cultura: string): Promise<OutraDespesaReceitaResponseDto[]>;
}
