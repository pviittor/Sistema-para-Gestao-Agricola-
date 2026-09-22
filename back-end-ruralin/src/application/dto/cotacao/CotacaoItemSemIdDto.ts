import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  MaxLength,
  IsNotEmpty,
  Validate,
} from 'class-validator'
import { IsExists } from '../../validators/IsExists'

/**
 * CotacaoItemSemIdDto - DTO para itens da cotacao sem FK do pai
 *
 * Padrao master-detail: cotacaoId e injetado pelo service apos criar o parent.
 */
export class CotacaoItemSemIdDto {
  @IsInt({ message: 'itemPedidoCompraId deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'itemPedidoCompraId e obrigatorio' })
  @Validate(IsExists, ['ItemPedidoCompra', 'id_item_ped'], { message: 'Item do pedido de compra nao encontrado' })
  itemPedidoCompraId!: number

  @IsInt({ message: 'produtoId deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'produtoId e obrigatorio' })
  @Validate(IsExists, ['Produto', 'id_prod'], { message: 'Produto nao encontrado' })
  produtoId!: number

  @IsString({ message: 'descricao deve ser uma string' })
  @IsNotEmpty({ message: 'descricao e obrigatorio' })
  @MaxLength(120, { message: 'descricao deve ter no maximo 120 caracteres' })
  descricao!: string

  @IsNumber({}, { message: 'quantidade deve ser um numero' })
  @IsNotEmpty({ message: 'quantidade e obrigatorio' })
  quantidade!: number

  @IsNumber({}, { message: 'vl_unitario deve ser um numero' })
  @IsNotEmpty({ message: 'vl_unitario e obrigatorio' })
  vl_unitario!: number

  @IsOptional()
  @IsString({ message: 'observacao deve ser uma string' })
  observacao?: string
}
