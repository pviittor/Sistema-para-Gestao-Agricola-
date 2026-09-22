import {
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { CreateDto } from '../CreateDto';

/**
 * DTO para criação de AlertaVencimentoConfig
 */
export class CreateAlertaVencimentoConfigDto extends CreateDto {
  /**
   * Tipo de título a monitorar
   */
  @IsNotEmpty({ message: 'Tipo de título é obrigatório' })
  @IsIn(['PAGAR', 'RECEBER', 'AMBOS'], { message: 'Tipo de título deve ser PAGAR, RECEBER ou AMBOS' })
  tipoTitulo!: string;

  /**
   * Dias de antecedência para o primeiro alerta
   */
  @IsOptional()
  @IsNumber({}, { message: 'Antecedência do alerta 1 deve ser um número' })
  @Min(0, { message: 'Antecedência do alerta 1 deve ser no mínimo 0' })
  @Max(90, { message: 'Antecedência do alerta 1 deve ser no máximo 90' })
  antecedenciaAlerta1Dias?: number;

  /**
   * Dias de antecedência para o segundo alerta
   */
  @IsOptional()
  @IsNumber({}, { message: 'Antecedência do alerta 2 deve ser um número' })
  @Min(0, { message: 'Antecedência do alerta 2 deve ser no mínimo 0' })
  @Max(90, { message: 'Antecedência do alerta 2 deve ser no máximo 90' })
  antecedenciaAlerta2Dias?: number;

  /**
   * Dias de antecedência para o terceiro alerta
   */
  @IsOptional()
  @IsNumber({}, { message: 'Antecedência do alerta 3 deve ser um número' })
  @Min(0, { message: 'Antecedência do alerta 3 deve ser no mínimo 0' })
  @Max(90, { message: 'Antecedência do alerta 3 deve ser no máximo 90' })
  antecedenciaAlerta3Dias?: number;

  /**
   * Se deve notificar no dia do vencimento
   */
  @IsOptional()
  @IsBoolean({ message: 'Notificar no vencimento deve ser um valor booleano' })
  notificarNoVencimento?: boolean;

  /**
   * Se deve notificar títulos vencidos
   */
  @IsOptional()
  @IsBoolean({ message: 'Notificar vencidos deve ser um valor booleano' })
  notificarVencidos?: boolean;

  /**
   * Frequência em dias para renotificação de títulos vencidos
   */
  @IsOptional()
  @IsNumber({}, { message: 'Frequência de renotificação deve ser um número' })
  @Min(1, { message: 'Frequência de renotificação deve ser no mínimo 1' })
  @Max(30, { message: 'Frequência de renotificação deve ser no máximo 30' })
  frequenciaRenotificacaoVencidosDias?: number;

  /**
   * Se a configuração está ativa
   */
  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um valor booleano' })
  ativo?: boolean;
}
