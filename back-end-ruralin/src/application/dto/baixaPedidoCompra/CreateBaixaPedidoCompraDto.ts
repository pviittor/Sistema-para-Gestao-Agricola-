import {
  IsOptional,
  IsInt,
  IsString,
  IsDateString,
  IsBoolean,
  IsNotEmpty,
  Min,
  Validate,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * CreateBaixaPedidoCompraDto - DTO para criacao de baixa de pedido de compra
 */
export class CreateBaixaPedidoCompraDto extends CreateDto {
  /**
   * ID da empresa (pessoa)
   */
  @IsInt({ message: 'ID da empresa deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID da empresa e obrigatorio' })
  @Min(1, { message: 'ID da empresa deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Empresa nao encontrada' })
  empresaId!: number;

  /**
   * ID da nota fiscal vinculada
   */
  @IsInt({ message: 'ID da nota fiscal deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID da nota fiscal e obrigatorio' })
  @Min(1, { message: 'ID da nota fiscal deve ser maior que zero' })
  @Validate(IsExists, ['NotaFiscal', 'id_nf'], { message: 'Nota fiscal nao encontrada' })
  notaFiscalId!: number;

  /**
   * ID do pedido de compra
   */
  @IsInt({ message: 'ID do pedido de compra deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID do pedido de compra e obrigatorio' })
  @Min(1, { message: 'ID do pedido de compra deve ser maior que zero' })
  @Validate(IsExists, ['PedidoCompra', 'id_ped_compra'], { message: 'Pedido de compra nao encontrado' })
  pedidoCompraId!: number;

  /**
   * Data da baixa/recebimento
   */
  @IsDateString({}, { message: 'Data da baixa deve ser uma data valida' })
  @IsNotEmpty({ message: 'Data da baixa e obrigatoria' })
  data_baixa!: string;

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
}
