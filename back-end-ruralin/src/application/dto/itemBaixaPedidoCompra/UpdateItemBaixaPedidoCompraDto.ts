import {
  IsOptional,
  IsInt,
  IsNumber,
  IsBoolean,
  Min,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdateItemBaixaPedidoCompraDto - DTO para atualizacao de item de baixa de pedido de compra
 *
 * Todos os campos sao opcionais, permitindo atualizacoes parciais.
 */
export class UpdateItemBaixaPedidoCompraDto extends UpdateDto {
  /**
   * ID da baixa de pedido de compra
   */
  @IsOptional()
  @IsInt({ message: 'ID da baixa deve ser um numero inteiro' })
  @Min(1, { message: 'ID da baixa deve ser maior que zero' })
  @Validate(IsExists, ['BaixaPedidoCompra', 'id_baixa_ped'], { message: 'Baixa de pedido de compra nao encontrada' })
  baixaPedidoCompraId?: number;

  /**
   * ID do item do pedido de compra
   */
  @IsOptional()
  @IsInt({ message: 'ID do item do pedido deve ser um numero inteiro' })
  @Min(1, { message: 'ID do item do pedido deve ser maior que zero' })
  @Validate(IsExists, ['ItemPedidoCompra', 'id_item_ped'], { message: 'Item de pedido de compra nao encontrado' })
  itemPedidoCompraId?: number;

  /**
   * ID do item da nota fiscal
   */
  @IsOptional()
  @IsInt({ message: 'ID do item da nota fiscal deve ser um numero inteiro' })
  @Min(1, { message: 'ID do item da nota fiscal deve ser maior que zero' })
  @Validate(IsExists, ['ItemNotaFiscal', 'id_item_nf'], { message: 'Item de nota fiscal nao encontrado' })
  itemNotaFiscalId?: number;

  /**
   * Quantidade baixada
   */
  @IsOptional()
  @IsNumber({}, { message: 'Quantidade deve ser um numero' })
  @Min(0.0001, { message: 'Quantidade deve ser no minimo 0.0001' })
  quantidade?: number;

  /**
   * Valor unitario do pedido de compra
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor unitario do pedido deve ser um numero' })
  @Min(0, { message: 'Valor unitario do pedido deve ser maior ou igual a zero' })
  vl_unitario_pedido?: number;

  /**
   * Valor unitario da nota fiscal
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor unitario da NF deve ser um numero' })
  @Min(0, { message: 'Valor unitario da NF deve ser maior ou igual a zero' })
  vl_unitario_nf?: number;

  /**
   * Valor da divergencia
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor da divergencia deve ser um numero' })
  vl_divergencia?: number;

  /**
   * Indica se a divergencia foi aprovada
   */
  @IsOptional()
  @IsBoolean({ message: 'Divergencia aprovada deve ser verdadeiro ou falso' })
  divergencia_aprovada?: boolean;
}
