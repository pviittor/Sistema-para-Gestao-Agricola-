import { IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdatePedidoCompraDto } from './UpdatePedidoCompraDto';
import { ItemPedidoCompraSemIdDto } from '../itemPedidoCompra/ItemPedidoCompraSemIdDto';

export class UpdatePedidoCompraCompletoDto extends UpdatePedidoCompraDto {
  @IsOptional()
  @IsArray({ message: 'Itens deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoCompraSemIdDto)
  itens?: ItemPedidoCompraSemIdDto[];
}
