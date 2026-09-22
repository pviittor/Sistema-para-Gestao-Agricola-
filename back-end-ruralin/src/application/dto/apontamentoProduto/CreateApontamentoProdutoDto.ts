import {
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsString,
  Min,
  Validate,
  IsNotEmpty,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * CreateApontamentoProdutoDto - DTO para criacao de apontamento de produto
 */
export class CreateApontamentoProdutoDto extends CreateDto {
  /**
   * ID do apontamento relacionado
   */
  @IsInt({ message: 'ID do apontamento deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID do apontamento e obrigatorio' })
  @Min(1, { message: 'ID do apontamento deve ser maior que zero' })
  @Validate(IsExists, ['Apontamento', 'id_apt'], { message: 'Apontamento nao encontrado' })
  idApontamento!: number;

  /**
   * ID do produto utilizado
   */
  @IsInt({ message: 'ID do produto deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID do produto e obrigatorio' })
  @Min(1, { message: 'ID do produto deve ser maior que zero' })
  @Validate(IsExists, ['Produto', 'id_prod'], { message: 'Produto nao encontrado' })
  idProduto!: number;

  /**
   * Quantidade do produto
   */
  @IsNumber({}, { message: 'Quantidade deve ser um numero' })
  @IsNotEmpty({ message: 'Quantidade e obrigatoria' })
  @Min(0, { message: 'Quantidade deve ser maior ou igual a zero' })
  quantidade!: number;

  /**
   * Valor do produto
   */
  @IsNumber({}, { message: 'Valor deve ser um numero' })
  @IsNotEmpty({ message: 'Valor e obrigatorio' })
  @Min(0, { message: 'Valor deve ser maior ou igual a zero' })
  valor!: number;

  /**
   * Temperatura registrada
   */
  @IsNumber({}, { message: 'Temperatura deve ser um numero' })
  @IsNotEmpty({ message: 'Temperatura e obrigatoria' })
  temperatura!: number;

  /**
   * Umidade registrada
   */
  @IsNumber({}, { message: 'Umidade deve ser um numero' })
  @IsNotEmpty({ message: 'Umidade e obrigatoria' })
  umidade!: number;

  /**
   * Periodo do apontamento
   */
  @IsInt({ message: 'Periodo deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'Periodo e obrigatorio' })
  periodo!: number;

  /**
   * Data do apontamento de produto
   */
  @IsDateString({}, { message: 'Data deve ser uma data valida no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data e obrigatoria' })
  data!: string;

  /**
   * Numero sequencial
   */
  @IsInt({ message: 'Numero deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'Numero e obrigatorio' })
  numero!: number;

  /**
   * Observacoes adicionais
   */
  @IsOptional()
  @IsString({ message: 'Observacao deve ser uma string' })
  observacao?: string;

  /**
   * Area aplicada
   */
  @IsNumber({}, { message: 'Area deve ser um numero' })
  @IsNotEmpty({ message: 'Area e obrigatoria' })
  @Min(0, { message: 'Area deve ser maior ou igual a zero' })
  area!: number;

  /**
   * Dosagem aplicada
   */
  @IsNumber({}, { message: 'Dosagem deve ser um numero' })
  @IsNotEmpty({ message: 'Dosagem e obrigatoria' })
  @Min(0, { message: 'Dosagem deve ser maior ou igual a zero' })
  dosagem!: number;

  /**
   * Indica se o produto foi convertido para moeda
   */
  @IsOptional()
  @IsBoolean({ message: 'produtoConvertidoMoeda deve ser um booleano' })
  produtoConvertidoMoeda?: boolean;
}
