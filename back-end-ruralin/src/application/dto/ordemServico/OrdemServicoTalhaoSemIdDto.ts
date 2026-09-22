import {
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
} from 'class-validator';

/**
 * OrdemServicoTalhaoSemIdDto - DTO para talhão da OS sem ordemServicoId
 *
 * Usado nos DTOs de criação/atualização completa onde o ordemServicoId
 * será preenchido automaticamente pelo service.
 */
export class OrdemServicoTalhaoSemIdDto {
  /**
   * ID do talhão
   */
  @IsNotEmpty({ message: 'ID do talhão é obrigatório' })
  @IsInt({ message: 'ID do talhão deve ser um número inteiro' })
  talhaoId!: number;

  /**
   * Área planejada em hectares
   */
  @IsOptional()
  @IsNumber({}, { message: 'Área planejada deve ser um número' })
  @Min(0, { message: 'Área planejada deve ser maior ou igual a zero' })
  areaPlanejada?: number;

  /**
   * Área real trabalhada em hectares
   */
  @IsOptional()
  @IsNumber({}, { message: 'Área real deve ser um número' })
  @Min(0, { message: 'Área real deve ser maior ou igual a zero' })
  areaReal?: number;

  /**
   * Observações sobre o talhão
   */
  @IsOptional()
  @IsString({ message: 'Observações deve ser uma string' })
  observacoes?: string;
}
