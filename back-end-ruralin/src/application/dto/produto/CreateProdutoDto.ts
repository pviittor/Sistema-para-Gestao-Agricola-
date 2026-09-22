import {
  IsString,
  IsInt,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  Min,
  Validate,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * CreateProdutoDto - DTO para criação de produto
 */
export class CreateProdutoDto extends CreateDto {
  /**
   * Descrição do produto
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  descricao_prod!: string;

  /**
   * ID da unidade de medida
   */
  @IsInt({ message: 'ID da unidade de medida deve ser um número inteiro' })
  @Min(1, { message: 'ID da unidade de medida deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID da unidade de medida é obrigatório' })
  @Validate(IsExists, ['UnidadeMedida', 'id_unidade'])
  idUnidadeMedida!: number;

  /**
   * Peso líquido do produto
   */
  @IsNumber({}, { message: 'Peso líquido deve ser um número' })
  @Min(0, { message: 'Peso líquido deve ser maior ou igual a zero' })
  @IsNotEmpty({ message: 'Peso líquido é obrigatório' })
  pesoliquido_prod!: number;

  /**
   * ID do grupo de produto
   */
  @IsInt({ message: 'ID do grupo deve ser um número inteiro' })
  @Min(1, { message: 'ID do grupo deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID do grupo é obrigatório' })
  @Validate(IsExists, ['GrupoProduto', 'id'])
  idGrupo!: number;

  /**
   * ID do subgrupo de produto
   */
  @IsInt({ message: 'ID do subgrupo deve ser um número inteiro' })
  @Min(1, { message: 'ID do subgrupo deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID do subgrupo é obrigatório' })
  @Validate(IsExists, ['SubGrupoProduto', 'id_sub'])
  idSubGrupo!: number;

  /**
   * ID do princípio ativo
   */
  @IsInt({ message: 'ID do princípio ativo deve ser um número inteiro' })
  @Min(1, { message: 'ID do princípio ativo deve ser maior que zero' })
  @IsOptional()
  @Validate(IsExists, ['PrincipioAtivo', 'id_principio'])
  idPrincipioAtivo?: number;

  /**
   * ID do fabricante (pessoa)
   */
  @IsInt({ message: 'ID do fabricante deve ser um número inteiro' })
  @Min(1, { message: 'ID do fabricante deve ser maior que zero' })
  @IsOptional()
  @Validate(IsExists, ['Pessoa', 'id_pessoa'])
  idFabricante?: number;

  /**
   * Preço médio do produto
   */
  @IsNumber({}, { message: 'Preço médio deve ser um número' })
  @Min(0, { message: 'Preço médio deve ser maior ou igual a zero' })
  @IsNotEmpty({ message: 'Preço médio é obrigatório' })
  precomedio_prod!: number;

  /**
   * Valor da última entrada do produto
   */
  @IsNumber({}, { message: 'Valor da última entrada deve ser um número' })
  @Min(0, { message: 'Valor da última entrada deve ser maior ou igual a zero' })
  @IsNotEmpty({ message: 'Valor da última entrada é obrigatório' })
  valorultimaentrada_prod!: number;

  /**
   * Data da última entrada do produto
   */
  @IsDateString({}, { message: 'Data da última entrada deve ser uma data válida no formato YYYY-MM-DD' })
  @IsOptional()
  dataultimaentrada_prod?: string;

  /**
   * Indica se o produto é combustível
   */
  @IsBoolean({ message: 'Combustível deve ser um valor booleano' })
  combustivel_prod!: boolean;

  /**
   * Indica se o produto utiliza o último custo
   */
  @IsBoolean({ message: 'Custo último custo deve ser um valor booleano' })
  custoUltimoCusto_prod!: boolean;

  /**
   * Valor do último custo do produto
   */
  @IsNumber({}, { message: 'Valor do último custo deve ser um número' })
  @Min(0, { message: 'Valor do último custo deve ser maior ou igual a zero' })
  @IsNotEmpty({ message: 'Valor do último custo é obrigatório' })
  valorUltimoCusto_prod!: number;

  /**
   * Data de atualização do custo
   */
  @IsDateString({}, { message: 'Data de atualização do custo deve ser uma data válida no formato YYYY-MM-DD' })
  @IsOptional()
  atualizacaoCusto_prod?: string;

  /**
   * Observações sobre o produto
   */
  @IsString({ message: 'Observação deve ser uma string' })
  @IsOptional()
  observacao_prod?: string;

  /**
   * ID do indexador (moeda)
   */
  @IsInt({ message: 'ID do indexador deve ser um número inteiro' })
  @Min(1, { message: 'ID do indexador deve ser maior que zero' })
  @IsOptional()
  @Validate(IsExists, ['Moeda', 'id_moeda'])
  idIndexador?: number;
}
