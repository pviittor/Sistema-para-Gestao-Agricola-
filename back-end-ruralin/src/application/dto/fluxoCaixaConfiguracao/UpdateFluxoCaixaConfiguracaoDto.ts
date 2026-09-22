/**
 * UpdateFluxoCaixaConfiguracaoDto - DTO para atualização/upsert de configuração do fluxo de caixa
 *
 * Todos os campos são opcionais, permitindo atualizações parciais.
 * Se nenhuma configuração existir para o tenant, o serviço cria automaticamente (upsert).
 *
 * @example
 * ```typescript
 * // PUT /api/fluxo-caixa/configuracao
 * {
 *   "saldoMinimoAlerta": 5000,
 *   "diasProjecaoPadrao": 90,
 *   "periodicidadePadrao": "mensal",
 *   "incluirTitulos": true
 * }
 * ```
 */

import {
  IsOptional,
  IsNumber,
  IsInt,
  IsString,
  IsBoolean,
  IsArray,
  IsIn,
  Min,
  Max,
  IsObject,
} from 'class-validator';

export class UpdateFluxoCaixaConfiguracaoDto {
  /**
   * Saldo mínimo para disparo de alertas
   */
  @IsNumber({}, { message: 'Saldo mínimo alerta deve ser um número' })
  @Min(0, { message: 'Saldo mínimo alerta deve ser maior ou igual a zero' })
  @IsOptional()
  saldoMinimoAlerta?: number;

  /**
   * Dias padrão para projeção do fluxo de caixa (7 a 730)
   */
  @IsInt({ message: 'Dias de projeção padrão deve ser um número inteiro' })
  @Min(7, { message: 'Dias de projeção padrão deve ser no mínimo 7' })
  @Max(730, { message: 'Dias de projeção padrão deve ser no máximo 730' })
  @IsOptional()
  diasProjecaoPadrao?: number;

  /**
   * Periodicidade padrão de agrupamento: diario, semanal, mensal ou safra
   */
  @IsString({ message: 'Periodicidade padrão deve ser uma string' })
  @IsIn(['diario', 'semanal', 'mensal', 'safra'], {
    message: 'Periodicidade padrão deve ser: diario, semanal, mensal ou safra',
  })
  @IsOptional()
  periodicidadePadrao?: string;

  /**
   * Incluir agreements (contratos de arrendamento) na projeção
   */
  @IsBoolean({ message: 'Incluir agreements deve ser um booleano' })
  @IsOptional()
  incluirAgreements?: boolean;

  /**
   * Incluir títulos a pagar/receber na projeção
   */
  @IsBoolean({ message: 'Incluir títulos deve ser um booleano' })
  @IsOptional()
  incluirTitulos?: boolean;

  /**
   * Incluir lançamentos recorrentes na projeção
   */
  @IsBoolean({ message: 'Incluir recorrentes deve ser um booleano' })
  @IsOptional()
  incluirRecorrentes?: boolean;

  /**
   * IDs das contas bancárias para filtro (null = todas)
   */
  @IsArray({ message: 'Contas bancárias filtro deve ser um array' })
  @IsOptional()
  contasBancariasFiltro?: number[] | null;

  /**
   * Configuração de cores para gráficos (null = padrão do sistema)
   */
  @IsObject({ message: 'Cores configuração deve ser um objeto' })
  @IsOptional()
  coresConfiguracao?: { entrada: string; saida: string; saldo: string } | null;
}
