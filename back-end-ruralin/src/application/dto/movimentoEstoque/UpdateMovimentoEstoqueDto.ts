import {
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
  Min,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';
import { IsValidEnum } from '../../validators/IsValidEnum';
import { TipoMovimento, OperacaoEstoque } from '../../../models/enums/MovimentoEstoqueEnums';

/**
 * UpdateMovimentoEstoqueDto - DTO para atualização de movimento de estoque
 *
 * Todos os campos são opcionais, permitindo atualizações parciais.
 */
export class UpdateMovimentoEstoqueDto extends UpdateDto {
  /**
   * ID do produto movimentado
   */
  @IsOptional()
  @IsInt({ message: 'ID do produto deve ser um numero inteiro' })
  @Min(1, { message: 'ID do produto deve ser maior que zero' })
  @Validate(IsExists, ['Produto', 'id_prod'], { message: 'Produto nao encontrado' })
  idProduto?: number;

  /**
   * ID do produtor (quando romaneio)
   */
  @IsOptional()
  @IsInt({ message: 'ID do produtor deve ser um numero inteiro' })
  @Min(1, { message: 'ID do produtor deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Produtor nao encontrado' })
  idProdutor?: number;

  /**
   * ID da fazenda (depósito)
   */
  @IsOptional()
  @IsInt({ message: 'ID da fazenda deve ser um numero inteiro' })
  @Min(1, { message: 'ID da fazenda deve ser maior que zero' })
  @Validate(IsExists, ['Fazenda', 'id'], { message: 'Fazenda nao encontrada' })
  idFazenda?: number;

  /**
   * ID do abastecimento relacionado
   */
  @IsOptional()
  @IsInt({ message: 'ID do abastecimento deve ser um numero inteiro' })
  @Min(1, { message: 'ID do abastecimento deve ser maior que zero' })
  @Validate(IsExists, ['Abastecimento', 'id_abast'], { message: 'Abastecimento nao encontrado' })
  idAbastecimento?: number;

  /**
   * Tipo de movimentação
   */
  @IsOptional()
  @IsInt({ message: 'Tipo de movimento deve ser um numero inteiro' })
  @Validate(IsValidEnum, [TipoMovimento], { message: 'Tipo de movimento invalido' })
  tipomov?: number;

  /**
   * Operação de estoque
   */
  @IsOptional()
  @IsInt({ message: 'Operacao deve ser um numero inteiro' })
  @Validate(IsValidEnum, [OperacaoEstoque], { message: 'Operacao de estoque invalida' })
  operacao?: number;

  /**
   * Quantidade movimentada
   */
  @IsOptional()
  @IsNumber({}, { message: 'Quantidade deve ser um numero' })
  quantidade?: number;

  /**
   * Data do movimento
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data deve ser uma data valida no formato YYYY-MM-DD' })
  data?: string;

  /**
   * Valor do movimento
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor deve ser um numero' })
  @Min(0, { message: 'Valor deve ser maior ou igual a zero' })
  valor?: number;
}
