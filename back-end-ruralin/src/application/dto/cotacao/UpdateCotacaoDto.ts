import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDateString,
  IsIn,
  MaxLength,
  Validate,
} from 'class-validator'
import { UpdateDto } from '../UpdateDto'
import { IsExists } from '../../validators/IsExists'

/**
 * UpdateCotacaoDto - DTO para atualizacao de cotacao
 *
 * Todos os campos sao opcionais.
 */
export class UpdateCotacaoDto extends UpdateDto {
  @IsOptional()
  @IsInt({ message: 'pedidoCompraId deve ser um numero inteiro' })
  @Validate(IsExists, ['PedidoCompra', 'id_ped_compra'], { message: 'Pedido de compra nao encontrado' })
  pedidoCompraId?: number

  @IsOptional()
  @IsInt({ message: 'fornecedorId deve ser um numero inteiro' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Fornecedor nao encontrado' })
  fornecedorId?: number

  @IsOptional()
  @IsString({ message: 'numero deve ser uma string' })
  @MaxLength(20, { message: 'numero deve ter no maximo 20 caracteres' })
  numero?: string

  @IsOptional()
  @IsDateString({}, { message: 'data_cotacao deve ser uma data valida' })
  data_cotacao?: string

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
