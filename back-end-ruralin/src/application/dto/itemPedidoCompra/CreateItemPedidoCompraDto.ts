import {
  IsOptional,
  IsInt,
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  MaxLength,
  Validate,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * CreateItemPedidoCompraDto - DTO para criacao de item de pedido de compra
 */
export class CreateItemPedidoCompraDto extends CreateDto {
  /**
   * ID do pedido de compra
   */
  @IsInt({ message: 'ID do pedido de compra deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID do pedido de compra e obrigatorio' })
  @Min(1, { message: 'ID do pedido de compra deve ser maior que zero' })
  @Validate(IsExists, ['PedidoCompra', 'id_ped_compra'], { message: 'Pedido de compra nao encontrado' })
  pedidoCompraId!: number;

  /**
   * ID do produto
   */
  @IsInt({ message: 'ID do produto deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID do produto e obrigatorio' })
  @Min(1, { message: 'ID do produto deve ser maior que zero' })
  @Validate(IsExists, ['Produto', 'id_prod'], { message: 'Produto nao encontrado' })
  produtoId!: number;

  /**
   * Descricao do produto no momento do pedido
   */
  @IsString({ message: 'Descricao deve ser uma string' })
  @IsNotEmpty({ message: 'Descricao e obrigatoria' })
  @MaxLength(120, { message: 'Descricao deve ter no maximo 120 caracteres' })
  descricao!: string;

  /**
   * Unidade de medida
   */
  @IsString({ message: 'Unidade deve ser uma string' })
  @IsNotEmpty({ message: 'Unidade e obrigatoria' })
  @MaxLength(6, { message: 'Unidade deve ter no maximo 6 caracteres' })
  unidade!: string;

  /**
   * Quantidade solicitada
   */
  @IsNumber({}, { message: 'Quantidade solicitada deve ser um numero' })
  @IsNotEmpty({ message: 'Quantidade solicitada e obrigatoria' })
  @Min(0.0001, { message: 'Quantidade solicitada deve ser no minimo 0.0001' })
  quantidade_solicitada!: number;

  /**
   * Valor unitario do item
   */
  @IsNumber({}, { message: 'Valor unitario deve ser um numero' })
  @IsNotEmpty({ message: 'Valor unitario e obrigatorio' })
  @Min(0, { message: 'Valor unitario deve ser maior ou igual a zero' })
  vl_unitario!: number;

  /**
   * Valor do desconto
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor do desconto deve ser um numero' })
  @Min(0, { message: 'Valor do desconto deve ser maior ou igual a zero' })
  vl_desconto?: number;

  /**
   * ID do deposito de destino
   */
  @IsOptional()
  @IsInt({ message: 'ID do deposito de destino deve ser um numero inteiro' })
  // TODO: Adicionar @IsExists quando Deposito for implementado
  depositoDestinoId?: number;

  /**
   * Observacao do item
   */
  @IsOptional()
  @IsString({ message: 'Observacao deve ser uma string' })
  observacao?: string;
}
