import {
  IsOptional,
  IsInt,
  IsString,
  IsDateString,
  IsBoolean,
  IsNumber,
  Min,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';
import { IsValidEnum } from '../../validators/IsValidEnum';
import { StatusBaixaPedidoCompra } from '../../../models/enums/PedidoCompraEnums';

/**
 * UpdateBaixaPedidoCompraDto - DTO para atualizacao de baixa de pedido de compra
 *
 * Todos os campos sao opcionais, permitindo atualizacoes parciais.
 */
export class UpdateBaixaPedidoCompraDto extends UpdateDto {
  /**
   * ID da empresa (pessoa)
   */
  @IsOptional()
  @IsInt({ message: 'ID da empresa deve ser um numero inteiro' })
  @Min(1, { message: 'ID da empresa deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Empresa nao encontrada' })
  empresaId?: number;

  /**
   * ID da nota fiscal vinculada
   */
  @IsOptional()
  @IsInt({ message: 'ID da nota fiscal deve ser um numero inteiro' })
  @Min(1, { message: 'ID da nota fiscal deve ser maior que zero' })
  @Validate(IsExists, ['NotaFiscal', 'id_nf'], { message: 'Nota fiscal nao encontrada' })
  notaFiscalId?: number;

  /**
   * ID do pedido de compra
   */
  @IsOptional()
  @IsInt({ message: 'ID do pedido de compra deve ser um numero inteiro' })
  @Min(1, { message: 'ID do pedido de compra deve ser maior que zero' })
  @Validate(IsExists, ['PedidoCompra', 'id_ped_compra'], { message: 'Pedido de compra nao encontrado' })
  pedidoCompraId?: number;

  /**
   * Status da baixa
   */
  @IsOptional()
  @IsString({ message: 'Status deve ser uma string' })
  @Validate(IsValidEnum, [StatusBaixaPedidoCompra], { message: 'Status de baixa invalido' })
  status?: string;

  /**
   * Data da baixa/recebimento
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data da baixa deve ser uma data valida' })
  data_baixa?: string;

  /**
   * Valor total da baixa
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor total da baixa deve ser um numero' })
  @Min(0, { message: 'Valor total da baixa deve ser maior ou igual a zero' })
  vl_total_baixa?: number;

  /**
   * Valor da divergencia
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor da divergencia deve ser um numero' })
  vl_divergencia?: number;

  /**
   * Percentual de divergencia
   */
  @IsOptional()
  @IsNumber({}, { message: 'Percentual de divergencia deve ser um numero' })
  percentual_divergencia?: number;

  /**
   * Indica se o estoque ja foi movimentado
   */
  @IsOptional()
  @IsBoolean({ message: 'Estoque movimentado deve ser verdadeiro ou falso' })
  estoque_movimentado?: boolean;

  /**
   * Indica se o financeiro ja foi gerado
   */
  @IsOptional()
  @IsBoolean({ message: 'Financeiro gerado deve ser verdadeiro ou falso' })
  financeiro_gerado?: boolean;

  /**
   * Indica se a baixa foi originada de importacao de XML
   */
  @IsOptional()
  @IsBoolean({ message: 'XML importado deve ser verdadeiro ou falso' })
  xml_importado?: boolean;

  /**
   * Observacoes gerais sobre a baixa
   */
  @IsOptional()
  @IsString({ message: 'Observacoes deve ser uma string' })
  observacoes?: string;

  /**
   * Motivo do cancelamento da baixa
   */
  @IsOptional()
  @IsString({ message: 'Motivo do cancelamento deve ser uma string' })
  motivo_cancelamento?: string;

  /**
   * Data do cancelamento
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data do cancelamento deve ser uma data valida' })
  data_cancelamento?: string;

  /**
   * Soft delete
   */
  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser verdadeiro ou falso' })
  ativo?: boolean;
}
