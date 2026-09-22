import {
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
} from 'class-validator';

/**
 * OrdemServicoMaquinaSemIdDto - DTO para máquina da OS sem ordemServicoId
 *
 * Usado nos DTOs de criação/atualização completa onde o ordemServicoId
 * será preenchido automaticamente pelo service.
 */
export class OrdemServicoMaquinaSemIdDto {
  /**
   * ID da máquina
   */
  @IsNotEmpty({ message: 'ID da máquina é obrigatório' })
  @IsInt({ message: 'ID da máquina deve ser um número inteiro' })
  maquinaId!: number;

  /**
   * ID do implemento utilizado (opcional)
   */
  @IsOptional()
  @IsInt({ message: 'ID do implemento deve ser um número inteiro' })
  implementoId?: number;

  /**
   * ID do operador (pessoa) da máquina (opcional)
   */
  @IsOptional()
  @IsInt({ message: 'ID do operador deve ser um número inteiro' })
  operadorId?: number;

  /**
   * Horas planejadas de uso da máquina
   */
  @IsOptional()
  @IsNumber({}, { message: 'Horas planejadas deve ser um número' })
  @Min(0, { message: 'Horas planejadas deve ser maior ou igual a zero' })
  horasPlanejadas?: number;

  /**
   * Custo por hora planejado
   */
  @IsOptional()
  @IsNumber({}, { message: 'Custo/hora planejado deve ser um número' })
  @Min(0, { message: 'Custo/hora planejado deve ser maior ou igual a zero' })
  custoHoraPlanejado?: number;

  /**
   * Horas reais trabalhadas
   */
  @IsOptional()
  @IsNumber({}, { message: 'Horas reais deve ser um número' })
  @Min(0, { message: 'Horas reais deve ser maior ou igual a zero' })
  horasReais?: number;

  /**
   * Custo por hora real
   */
  @IsOptional()
  @IsNumber({}, { message: 'Custo/hora real deve ser um número' })
  @Min(0, { message: 'Custo/hora real deve ser maior ou igual a zero' })
  custoHoraReal?: number;

  /**
   * Horímetro no início da operação
   */
  @IsOptional()
  @IsNumber({}, { message: 'Horímetro início deve ser um número' })
  @Min(0, { message: 'Horímetro início deve ser maior ou igual a zero' })
  horimetroInicio?: number;

  /**
   * Horímetro no fim da operação
   */
  @IsOptional()
  @IsNumber({}, { message: 'Horímetro fim deve ser um número' })
  @Min(0, { message: 'Horímetro fim deve ser maior ou igual a zero' })
  horimetroFim?: number;

  /**
   * Área trabalhada pela máquina em hectares
   */
  @IsOptional()
  @IsNumber({}, { message: 'Área trabalhada deve ser um número' })
  @Min(0, { message: 'Área trabalhada deve ser maior ou igual a zero' })
  areaTrabalhada?: number;

  /**
   * Consumo de combustível em litros
   */
  @IsOptional()
  @IsNumber({}, { message: 'Consumo de combustível deve ser um número' })
  @Min(0, { message: 'Consumo de combustível deve ser maior ou igual a zero' })
  consumoCombustivel?: number;

  /**
   * Observações sobre a máquina
   */
  @IsOptional()
  @IsString({ message: 'Observações deve ser uma string' })
  observacoes?: string;
}
