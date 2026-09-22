import {
  IsOptional,
  IsInt,
  IsDateString,
  Min,
  Validate,
} from 'class-validator';
import { IsExists } from '../../validators/IsExists';

/**
 * FiltrosPlanejadoRealizadoDto - DTO para filtros de relatório de planejado vs realizado
 * 
 * DTO usado no endpoint de consulta de planejado vs realizado para filtrar os resultados.
 */
export class FiltrosPlanejadoRealizadoDto {
  /**
   * ID da safra para filtrar (opcional)
   */
  @IsOptional()
  @IsInt({ message: 'ID da safra deve ser um número inteiro' })
  @Min(1, { message: 'ID da safra deve ser maior que zero' })
  @Validate(IsExists, ['Safra', 'id'], { message: 'Safra não encontrada' })
  idSafra?: number;

  /**
   * ID do plano de contas gerencial para filtrar (opcional)
   */
  @IsOptional()
  @IsInt({ message: 'ID do plano de contas gerencial deve ser um número inteiro' })
  @Min(1, { message: 'ID do plano de contas gerencial deve ser maior que zero' })
  @Validate(IsExists, ['PlanoContaGerencial', 'id'], { message: 'Plano de contas gerencial não encontrado' })
  idPlanoContaGerencial?: number;

  /**
   * ID do centro de custo para filtrar (opcional)
   */
  @IsOptional()
  @IsInt({ message: 'ID do centro de custo deve ser um número inteiro' })
  @Min(1, { message: 'ID do centro de custo deve ser maior que zero' })
  @Validate(IsExists, ['CentroCusto', 'id'], { message: 'Centro de custo não encontrado' })
  idCentroCusto?: number;

  /**
   * Data inicial do período para filtrar (opcional)
   * Filtra títulos com dataLancamento >= dataInicio
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data inicial deve ser uma data válida no formato ISO' })
  dataInicio?: string;

  /**
   * Data final do período para filtrar (opcional)
   * Filtra títulos com dataLancamento <= dataFim
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data final deve ser uma data válida no formato ISO' })
  dataFim?: string;

  /**
   * Tipo de título para filtrar (opcional)
   * 'PAGAR' = apenas títulos a pagar
   * 'RECEBER' = apenas títulos a receber
   * Se não informado, retorna ambos
   */
  @IsOptional()
  tipoTitulo?: 'PAGAR' | 'RECEBER';

  /**
   * Agrupar por safra (opcional)
   * Se true, agrupa os resultados por safra
   */
  @IsOptional()
  agruparPorSafra?: boolean;

  /**
   * Agrupar por plano de contas (opcional)
   * Se true, agrupa os resultados por plano de contas
   */
  @IsOptional()
  agruparPorPlanoConta?: boolean;

  /**
   * Agrupar por centro de custo (opcional)
   * Se true, agrupa os resultados por centro de custo
   */
  @IsOptional()
  agruparPorCentroCusto?: boolean;
}
