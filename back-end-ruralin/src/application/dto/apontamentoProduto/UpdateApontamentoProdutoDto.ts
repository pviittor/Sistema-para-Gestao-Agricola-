import {
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsString,
  Min,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdateApontamentoProdutoDto - DTO para atualizacao de apontamento de produto
 *
 * Todos os campos sao opcionais, permitindo atualizacoes parciais.
 */
export class UpdateApontamentoProdutoDto extends UpdateDto {
  /**
   * ID do apontamento relacionado
   */
  @IsOptional()
  @IsInt({ message: 'ID do apontamento deve ser um numero inteiro' })
  @Min(1, { message: 'ID do apontamento deve ser maior que zero' })
  @Validate(IsExists, ['Apontamento', 'id_apt'], { message: 'Apontamento nao encontrado' })
  idApontamento?: number;

  /**
   * ID do produto utilizado
   */
  @IsOptional()
  @IsInt({ message: 'ID do produto deve ser um numero inteiro' })
  @Min(1, { message: 'ID do produto deve ser maior que zero' })
  @Validate(IsExists, ['Produto', 'id_prod'], { message: 'Produto nao encontrado' })
  idProduto?: number;

  /**
   * Quantidade do produto
   */
  @IsOptional()
  @IsNumber({}, { message: 'Quantidade deve ser um numero' })
  @Min(0, { message: 'Quantidade deve ser maior ou igual a zero' })
  quantidade?: number;

  /**
   * Valor do produto
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor deve ser um numero' })
  @Min(0, { message: 'Valor deve ser maior ou igual a zero' })
  valor?: number;

  /**
   * Temperatura registrada
   */
  @IsOptional()
  @IsNumber({}, { message: 'Temperatura deve ser um numero' })
  temperatura?: number;

  /**
   * Umidade registrada
   */
  @IsOptional()
  @IsNumber({}, { message: 'Umidade deve ser um numero' })
  umidade?: number;

  /**
   * Periodo do apontamento
   */
  @IsOptional()
  @IsInt({ message: 'Periodo deve ser um numero inteiro' })
  periodo?: number;

  /**
   * Data do apontamento de produto
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data deve ser uma data valida no formato YYYY-MM-DD' })
  data?: string;

  /**
   * Numero sequencial
   */
  @IsOptional()
  @IsInt({ message: 'Numero deve ser um numero inteiro' })
  numero?: number;

  /**
   * Observacoes adicionais
   */
  @IsOptional()
  @IsString({ message: 'Observacao deve ser uma string' })
  observacao?: string;

  /**
   * Area aplicada
   */
  @IsOptional()
  @IsNumber({}, { message: 'Area deve ser um numero' })
  @Min(0, { message: 'Area deve ser maior ou igual a zero' })
  area?: number;

  /**
   * Dosagem aplicada
   */
  @IsOptional()
  @IsNumber({}, { message: 'Dosagem deve ser um numero' })
  @Min(0, { message: 'Dosagem deve ser maior ou igual a zero' })
  dosagem?: number;

  /**
   * Indica se o produto foi convertido para moeda
   */
  @IsOptional()
  @IsBoolean({ message: 'produtoConvertidoMoeda deve ser um booleano' })
  produtoConvertidoMoeda?: boolean;
}
