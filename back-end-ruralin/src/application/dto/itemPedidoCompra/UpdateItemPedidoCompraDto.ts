import {
  IsOptional,
  IsInt,
  IsString,
  IsNumber,
  Min,
  MaxLength,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdateItemPedidoCompraDto - DTO para atualizacao de item de pedido de compra
 *
 * Todos os campos sao opcionais, permitindo atualizacoes parciais.
 */
export class UpdateItemPedidoCompraDto extends UpdateDto {
  /**
   * ID do pedido de compra
   */
  @IsOptional()
  @IsInt({ message: 'ID do pedido de compra deve ser um numero inteiro' })
  @Min(1, { message: 'ID do pedido de compra deve ser maior que zero' })
  @Validate(IsExists, ['PedidoCompra', 'id_ped_compra'], { message: 'Pedido de compra nao encontrado' })
  pedidoCompraId?: number;

  /**
   * ID do produto
   */
  @IsOptional()
  @IsInt({ message: 'ID do produto deve ser um numero inteiro' })
  @Min(1, { message: 'ID do produto deve ser maior que zero' })
  @Validate(IsExists, ['Produto', 'id_prod'], { message: 'Produto nao encontrado' })
  produtoId?: number;

  /**
   * Descricao do produto no momento do pedido
   */
  @IsOptional()
  @IsString({ message: 'Descricao deve ser uma string' })
  @MaxLength(120, { message: 'Descricao deve ter no maximo 120 caracteres' })
  descricao?: string;

  /**
   * Unidade de medida
   */
  @IsOptional()
  @IsString({ message: 'Unidade deve ser uma string' })
  @MaxLength(6, { message: 'Unidade deve ter no maximo 6 caracteres' })
  unidade?: string;

  /**
   * Quantidade solicitada
   */
  @IsOptional()
  @IsNumber({}, { message: 'Quantidade solicitada deve ser um numero' })
  @Min(0.0001, { message: 'Quantidade solicitada deve ser no minimo 0.0001' })
  quantidade_solicitada?: number;

  /**
   * Valor unitario do item
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor unitario deve ser um numero' })
  @Min(0, { message: 'Valor unitario deve ser maior ou igual a zero' })
  vl_unitario?: number;

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
