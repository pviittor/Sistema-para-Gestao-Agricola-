import {
  IsString,
  IsInt,
  IsNumber,
  IsBoolean,
  IsDateString,
  Min,
  Validate,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdateProdutoDto - DTO para atualização de produto
 */
export class UpdateProdutoDto extends UpdateDto {
  @IsString({ message: 'Descrição deve ser uma string' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  @IsOptional()
  descricao_prod?: string;

  @IsInt({ message: 'ID da unidade de medida deve ser um número inteiro' })
  @Min(1, { message: 'ID da unidade de medida deve ser maior que zero' })
  @Validate(IsExists, ['UnidadeMedida', 'id_unidade'])
  @IsOptional()
  idUnidadeMedida?: number;

  @IsNumber({}, { message: 'Peso líquido deve ser um número' })
  @Min(0, { message: 'Peso líquido deve ser maior ou igual a zero' })
  @IsOptional()
  pesoliquido_prod?: number;

  @IsInt({ message: 'ID do grupo deve ser um número inteiro' })
  @Min(1, { message: 'ID do grupo deve ser maior que zero' })
  @Validate(IsExists, ['GrupoProduto', 'id'])
  @IsOptional()
  idGrupo?: number;

  @IsInt({ message: 'ID do subgrupo deve ser um número inteiro' })
  @Min(1, { message: 'ID do subgrupo deve ser maior que zero' })
  @Validate(IsExists, ['SubGrupoProduto', 'id_sub'])
  @IsOptional()
  idSubGrupo?: number;

  @IsInt({ message: 'ID do princípio ativo deve ser um número inteiro' })
  @Min(1, { message: 'ID do princípio ativo deve ser maior que zero' })
  @Validate(IsExists, ['PrincipioAtivo', 'id_principio'])
  @IsOptional()
  idPrincipioAtivo?: number;

  @IsInt({ message: 'ID do fabricante deve ser um número inteiro' })
  @Min(1, { message: 'ID do fabricante deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'])
  @IsOptional()
  idFabricante?: number;

  @IsNumber({}, { message: 'Preço médio deve ser um número' })
  @Min(0, { message: 'Preço médio deve ser maior ou igual a zero' })
  @IsOptional()
  precomedio_prod?: number;

  @IsNumber({}, { message: 'Valor da última entrada deve ser um número' })
  @Min(0, { message: 'Valor da última entrada deve ser maior ou igual a zero' })
  @IsOptional()
  valorultimaentrada_prod?: number;

  @IsDateString({}, { message: 'Data da última entrada deve ser uma data válida no formato YYYY-MM-DD' })
  @IsOptional()
  dataultimaentrada_prod?: string;

  @IsBoolean({ message: 'Combustível deve ser um valor booleano' })
  @IsOptional()
  combustivel_prod?: boolean;

  @IsBoolean({ message: 'Custo último custo deve ser um valor booleano' })
  @IsOptional()
  custoUltimoCusto_prod?: boolean;

  @IsNumber({}, { message: 'Valor do último custo deve ser um número' })
  @Min(0, { message: 'Valor do último custo deve ser maior ou igual a zero' })
  @IsOptional()
  valorUltimoCusto_prod?: number;

  @IsDateString({}, { message: 'Data de atualização do custo deve ser uma data válida no formato YYYY-MM-DD' })
  @IsOptional()
  atualizacaoCusto_prod?: string;

  @IsString({ message: 'Observação deve ser uma string' })
  @IsOptional()
  observacao_prod?: string;

  @IsInt({ message: 'ID do indexador deve ser um número inteiro' })
  @Min(1, { message: 'ID do indexador deve ser maior que zero' })
  @Validate(IsExists, ['Moeda', 'id_moeda'])
  @IsOptional()
  idIndexador?: number;
}
