import {
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
} from 'class-validator';

/**
 * OrdemServicoInsumoSemIdDto - DTO para insumo da OS sem ordemServicoId
 *
 * Usado nos DTOs de criação/atualização completa onde o ordemServicoId
 * será preenchido automaticamente pelo service.
 */
export class OrdemServicoInsumoSemIdDto {
  /**
   * ID do produto (insumo)
   */
  @IsNotEmpty({ message: 'ID do produto é obrigatório' })
  @IsInt({ message: 'ID do produto deve ser um número inteiro' })
  produtoId!: number;

  /**
   * ID da unidade de medida
   */
  @IsOptional()
  @IsInt({ message: 'ID da unidade de medida deve ser um número inteiro' })
  unidadeMedidaId?: number;

  /**
   * Quantidade planejada
   */
  @IsOptional()
  @IsNumber({}, { message: 'Quantidade planejada deve ser um número' })
  @Min(0, { message: 'Quantidade planejada deve ser maior ou igual a zero' })
  quantidadePlanejada?: number;

  /**
   * Custo unitário planejado
   */
  @IsOptional()
  @IsNumber({}, { message: 'Custo unitário planejado deve ser um número' })
  @Min(0, { message: 'Custo unitário planejado deve ser maior ou igual a zero' })
  custoUnitarioPlanejado?: number;

  /**
   * Quantidade real utilizada
   */
  @IsOptional()
  @IsNumber({}, { message: 'Quantidade real deve ser um número' })
  @Min(0, { message: 'Quantidade real deve ser maior ou igual a zero' })
  quantidadeReal?: number;

  /**
   * Custo unitário real
   */
  @IsOptional()
  @IsNumber({}, { message: 'Custo unitário real deve ser um número' })
  @Min(0, { message: 'Custo unitário real deve ser maior ou igual a zero' })
  custoUnitarioReal?: number;

  /**
   * Dosagem do produto
   */
  @IsOptional()
  @IsNumber({}, { message: 'Dosagem deve ser um número' })
  @Min(0, { message: 'Dosagem deve ser maior ou igual a zero' })
  dosagem?: number;

  /**
   * Área onde o produto foi aplicado em hectares
   */
  @IsOptional()
  @IsNumber({}, { message: 'Área aplicada deve ser um número' })
  @Min(0, { message: 'Área aplicada deve ser maior ou igual a zero' })
  areaAplicada?: number;

  /**
   * Observações sobre o insumo
   */
  @IsOptional()
  @IsString({ message: 'Observações deve ser uma string' })
  observacoes?: string;
}
