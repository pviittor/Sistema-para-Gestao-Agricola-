import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsIn,
  MaxLength,
  IsNotEmpty,
  Validate,
} from 'class-validator'
import { CreateDto } from '../CreateDto'
import { IsExists } from '../../validators/IsExists'

/**
 * CreateCotacaoDto - DTO para criacao de cotacao
 */
export class CreateCotacaoDto extends CreateDto {
  @IsInt({ message: 'pedidoCompraId deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'pedidoCompraId e obrigatorio' })
  @Validate(IsExists, ['PedidoCompra', 'id_ped_compra'], { message: 'Pedido de compra nao encontrado' })
  pedidoCompraId!: number

  @IsInt({ message: 'fornecedorId deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'fornecedorId e obrigatorio' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Fornecedor nao encontrado' })
  fornecedorId!: number

  @IsString({ message: 'numero deve ser uma string' })
  @IsNotEmpty({ message: 'numero e obrigatorio' })
  @MaxLength(20, { message: 'numero deve ter no maximo 20 caracteres' })
  numero!: string

  @IsDateString({}, { message: 'data_cotacao deve ser uma data valida' })
  @IsNotEmpty({ message: 'data_cotacao e obrigatorio' })
  data_cotacao!: string

  @IsOptional()
  @IsDateString({}, { message: 'data_validade deve ser uma data valida' })
  data_validade?: string

  @IsOptional()
  @IsInt({ message: 'prazo_entrega_dias deve ser um numero inteiro' })
  prazo_entrega_dias?: number

  @IsOptional()
  @IsString({ message: 'condicao_pagamento deve ser uma string' })
  @MaxLength(100, { message: 'condicao_pagamento deve ter no maximo 100 caracteres' })
  condicao_pagamento?: string

  @IsOptional()
  @IsIn(['pendente', 'selecionada', 'rejeitada'], { message: 'status deve ser pendente, selecionada ou rejeitada' })
  status?: string

  @IsOptional()
  @IsString({ message: 'observacoes deve ser uma string' })
  observacoes?: string

  @IsOptional()
  @IsBoolean({ message: 'ativo deve ser um valor booleano' })
  ativo?: boolean
}
