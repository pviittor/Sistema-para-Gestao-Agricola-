import {
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * ValidarOrdemServicoDto - DTO para validação de uma OS
 *
 * Transiciona o status de CONCLUIDA para VALIDADA.
 */
export class ValidarOrdemServicoDto {
  /**
   * Observações registradas na validação
   */
  @IsOptional()
  @IsString({ message: 'Observações deve ser uma string' })
  observacoes?: string;
}
