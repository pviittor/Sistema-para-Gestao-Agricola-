import {
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
  IsNotEmpty,
  IsInt,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTituloPagarDto } from './CreateTituloPagarDto';
import { RateioPlanoContaSemIdDto } from './RateioPlanoContaSemIdDto';
import { RateioCentroCustoSemIdDto } from './RateioCentroCustoSemIdDto';
import { ModeloJuros } from '../../../models/TituloPagar';

/**
 * CreateTituloPagarParceladoDto - DTO para criação de título com parcelamento automático
 *
 * Usado quando tipoGeracao = 'PARCELADO'. As parcelas são geradas automaticamente
 * pelo ParcelamentoService com base nos campos de configuração.
 *
 * RN-01: Gera automaticamente N parcelas dentro da mesma transação
 * RN-02: Soma dos valorParcela == valorTitulo (ajuste de centavos na última parcela)
 * RN-03: Juros simples e Tabela Price configuráveis
 * RN-04: dataVencimento[i] = dataPrimeiraParcela + (i-1) * intervaloParcelasDias
 */
export class CreateTituloPagarParceladoDto extends CreateTituloPagarDto {
  /**
   * Quantidade de parcelas a gerar
   */
  @IsInt({ message: 'Quantidade de parcelas deve ser um número inteiro' })
  @Min(1, { message: 'Quantidade de parcelas deve ser no mínimo 1' })
  @IsNotEmpty({ message: 'Quantidade de parcelas é obrigatória' })
  quantidadeParcelas!: number;

  /**
   * Data de vencimento da primeira parcela (obrigatório para parcelado)
   */
  @IsDateString({}, { message: 'Data da primeira parcela deve ser uma data válida' })
  @IsNotEmpty({ message: 'Data da primeira parcela é obrigatória para parcelamento' })
  dataPrimeiraParcela!: string;

  /**
   * Intervalo em dias entre parcelas (default: 30)
   */
  @IsOptional()
  @IsInt({ message: 'Intervalo de parcelas deve ser um número inteiro' })
  @Min(1, { message: 'Intervalo de parcelas deve ser maior que zero' })
  intervaloParcelasDias?: number;

  /**
   * Taxa de juros ao mês (default: 0 = sem juros)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Taxa de juros deve ser um número' })
  @Min(0, { message: 'Taxa de juros deve ser maior ou igual a zero' })
  taxaJurosAm?: number;

  /**
   * Modelo de juros: SIMPLES ou PRICE (default: SIMPLES)
   */
  @IsOptional()
  @IsEnum(ModeloJuros, { message: 'Modelo de juros deve ser SIMPLES ou PRICE' })
  modeloJuros?: ModeloJuros;

  /**
   * Rateios por plano de contas (opcional)
   */
  @IsOptional()
  @IsArray({ message: 'Rateios por plano de contas deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => RateioPlanoContaSemIdDto)
  rateiosPlanoConta?: RateioPlanoContaSemIdDto[];

  /**
   * Rateios por centro de custo (opcional)
   */
  @IsOptional()
  @IsArray({ message: 'Rateios por centro de custo deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => RateioCentroCustoSemIdDto)
  rateiosCentroCusto?: RateioCentroCustoSemIdDto[];
}
