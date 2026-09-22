import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePedidoCompraDto } from './CreatePedidoCompraDto';
import { ItemPedidoCompraSemIdDto } from '../itemPedidoCompra/ItemPedidoCompraSemIdDto';

export class CreatePedidoCompraCompletoDto extends CreatePedidoCompraDto {
  @IsArray({ message: 'Itens deve ser um array' })
  @ArrayMinSize(1, { message: 'Deve haver pelo menos um item no pedido de compra' })
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoCompraSemIdDto)
  itens!: ItemPedidoCompraSemIdDto[];
}
