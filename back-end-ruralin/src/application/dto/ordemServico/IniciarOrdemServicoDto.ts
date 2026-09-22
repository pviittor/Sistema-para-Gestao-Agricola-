import {
  IsOptional,
  IsDateString,
} from 'class-validator';

/**
 * IniciarOrdemServicoDto - DTO para iniciar execução de uma OS
 *
 * Transiciona o status de AGUARDANDO para EM_EXECUCAO.
 * Se dataInicioReal não for informada, o service usa a data de hoje.
 */
export class IniciarOrdemServicoDto {
  /**
   * Data real de início da execução (default: hoje no service se não informado)
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data de início real deve ser uma data válida no formato YYYY-MM-DD' })
  dataInicioReal?: string;
}
