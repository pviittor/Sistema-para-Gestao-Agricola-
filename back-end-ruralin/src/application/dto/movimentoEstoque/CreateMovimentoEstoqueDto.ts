import {
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
  Min,
  Validate,
  IsNotEmpty,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';
import { IsValidEnum } from '../../validators/IsValidEnum';
import { TipoMovimento, OperacaoEstoque } from '../../../models/enums/MovimentoEstoqueEnums';

/**
 * CreateMovimentoEstoqueDto - DTO para criação de movimento de estoque
 */
export class CreateMovimentoEstoqueDto extends CreateDto {
  /**
   * ID do produto movimentado
   */
  @IsInt({ message: 'ID do produto deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID do produto e obrigatorio' })
  @Min(1, { message: 'ID do produto deve ser maior que zero' })
  @Validate(IsExists, ['Produto', 'id_prod'], { message: 'Produto nao encontrado' })
  idProduto!: number;

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
  @IsInt({ message: 'ID da fazenda deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID da fazenda e obrigatorio' })
  @Min(1, { message: 'ID da fazenda deve ser maior que zero' })
  @Validate(IsExists, ['Fazenda', 'id'], { message: 'Fazenda nao encontrada' })
  idFazenda!: number;

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
  @IsInt({ message: 'Tipo de movimento deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'Tipo de movimento e obrigatorio' })
  @Validate(IsValidEnum, [TipoMovimento], { message: 'Tipo de movimento invalido' })
  tipomov!: number;

  /**
   * Operação de estoque
   */
  @IsInt({ message: 'Operacao deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'Operacao e obrigatoria' })
  @Validate(IsValidEnum, [OperacaoEstoque], { message: 'Operacao de estoque invalida' })
  operacao!: number;

  /**
   * Quantidade movimentada
   */
  @IsNumber({}, { message: 'Quantidade deve ser um numero' })
  @IsNotEmpty({ message: 'Quantidade e obrigatoria' })
  quantidade!: number;

  /**
   * Data do movimento
   */
  @IsDateString({}, { message: 'Data deve ser uma data valida no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data e obrigatoria' })
  data!: string;

  /**
   * Valor do movimento
   */
  @IsNumber({}, { message: 'Valor deve ser um numero' })
  @IsNotEmpty({ message: 'Valor e obrigatorio' })
  @Min(0, { message: 'Valor deve ser maior ou igual a zero' })
  valor!: number;
}
