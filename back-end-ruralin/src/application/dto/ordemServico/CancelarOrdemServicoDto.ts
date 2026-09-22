import {
  IsString,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

/**
 * CancelarOrdemServicoDto - DTO para cancelamento de uma OS
 *
 * Pode ser aplicado de qualquer status exceto CONCLUIDA e VALIDADA.
 */
export class CancelarOrdemServicoDto {
  /**
   * Motivo do cancelamento (mínimo 10 caracteres para garantir explicação adequada)
   */
  @IsNotEmpty({ message: 'Motivo do cancelamento é obrigatório' })
  @IsString({ message: 'Motivo do cancelamento deve ser uma string' })
  @MinLength(10, { message: 'Motivo do cancelamento deve ter no mínimo 10 caracteres' })
  motivoCancelamento!: string;
}
