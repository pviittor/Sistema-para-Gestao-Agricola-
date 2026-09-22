import {
  IsOptional,
  IsInt,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
  Min,
  Validate,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * CreateItemBaixaPedidoCompraDto - DTO para criacao de item de baixa de pedido de compra
 */
export class CreateItemBaixaPedidoCompraDto extends CreateDto {
  /**
   * ID da baixa de pedido de compra
   */
  @IsInt({ message: 'ID da baixa deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID da baixa e obrigatorio' })
  @Min(1, { message: 'ID da baixa deve ser maior que zero' })
  @Validate(IsExists, ['BaixaPedidoCompra', 'id_baixa_ped'], { message: 'Baixa de pedido de compra nao encontrada' })
  baixaPedidoCompraId!: number;

  /**
   * ID do item do pedido de compra
   */
  @IsInt({ message: 'ID do item do pedido deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID do item do pedido e obrigatorio' })
  @Min(1, { message: 'ID do item do pedido deve ser maior que zero' })
  @Validate(IsExists, ['ItemPedidoCompra', 'id_item_ped'], { message: 'Item de pedido de compra nao encontrado' })
  itemPedidoCompraId!: number;

  /**
   * ID do item da nota fiscal
   */
  @IsInt({ message: 'ID do item da nota fiscal deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID do item da nota fiscal e obrigatorio' })
  @Min(1, { message: 'ID do item da nota fiscal deve ser maior que zero' })
  @Validate(IsExists, ['ItemNotaFiscal', 'id_item_nf'], { message: 'Item de nota fiscal nao encontrado' })
  itemNotaFiscalId!: number;

  /**
   * Quantidade baixada
   */
  @IsNumber({}, { message: 'Quantidade deve ser um numero' })
  @IsNotEmpty({ message: 'Quantidade e obrigatoria' })
  @Min(0.0001, { message: 'Quantidade deve ser no minimo 0.0001' })
  quantidade!: number;

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
   * Indica se a divergencia foi aprovada
   */
  @IsOptional()
  @IsBoolean({ message: 'Divergencia aprovada deve ser verdadeiro ou falso' })
  divergencia_aprovada?: boolean;
}
