import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDateString,
  IsNumber,
  Min,
  MaxLength,
  IsNotEmpty,
  Validate,
  IsEnum,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';
import { IsUnique } from '../../validators/IsUnique';
import { StatusTituloReceber } from '../../../models/TituloReceber';

/**
 * CreateTituloReceberDto - DTO para criação de título a receber
 * 
 * DTO usado no endpoint de criação de título a receber com todas as validações necessárias.
 */
export class CreateTituloReceberDto extends CreateDto {
  /**
   * ID do cliente (pessoa marcada como cliente)
   */
  @IsInt({ message: 'ID do cliente deve ser um número inteiro' })
  @Min(1, { message: 'ID do cliente deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID do cliente é obrigatório' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Cliente não encontrado' })
  idCliente!: number;

  /**
   * ID do portador (pessoa marcada como portador)
   */
  @IsInt({ message: 'ID do portador deve ser um número inteiro' })
  @Min(1, { message: 'ID do portador deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID do portador é obrigatório' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Portador não encontrado' })
  idPortador!: number;

  /**
   * ID do produtor (pessoa marcada como produtor)
   */
  @IsInt({ message: 'ID do produtor deve ser um número inteiro' })
  @Min(1, { message: 'ID do produtor deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID do produtor é obrigatório' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Produtor não encontrado' })
  idProdutor!: number;

  /**
   * ID da fazenda
   */
  @IsInt({ message: 'ID da fazenda deve ser um número inteiro' })
  @Min(1, { message: 'ID da fazenda deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID da fazenda é obrigatório' })
  @Validate(IsExists, ['Fazenda', 'id'], { message: 'Fazenda não encontrada' })
  idFazenda!: number;

  /**
   * ID da safra
   */
  @IsInt({ message: 'ID da safra deve ser um número inteiro' })
  @Min(1, { message: 'ID da safra deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID da safra é obrigatório' })
  @Validate(IsExists, ['Safra', 'id'], { message: 'Safra não encontrada' })
  idSafra!: number;

  /**
   * ID da moeda
   */
  @IsInt({ message: 'ID da moeda deve ser um número inteiro' })
  @Min(1, { message: 'ID da moeda deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID da moeda é obrigatório' })
  @Validate(IsExists, ['Moeda', 'id_moeda'], { message: 'Moeda não encontrada' })
  idMoeda!: number;

  /**
   * Data de lançamento do título
   */
  @IsDateString({}, { message: 'Data de lançamento deve ser uma data válida no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data de lançamento é obrigatória' })
  dataLancamento!: string;

  /**
   * Número do título (único por tenant)
   */
  @IsString({ message: 'Número do título deve ser uma string' })
  @IsNotEmpty({ message: 'Número do título é obrigatório' })
  @MaxLength(100, { message: 'Número do título deve ter no máximo 100 caracteres' })
  @IsUnique('TituloReceber', 'numeroTitulo', undefined, { message: 'Já existe um título com este número para este tenant' })
  numeroTitulo!: string;

  /**
   * Valor total do título (soma de todas as parcelas)
   */
  @IsNumber({}, { message: 'Valor do título deve ser um número' })
  @Min(0.01, { message: 'Valor do título deve ser maior que zero' })
  @IsNotEmpty({ message: 'Valor do título é obrigatório' })
  valorTitulo!: number;

  /**
   * Valor do título na moeda original
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor na moeda original deve ser um número' })
  @Min(0, { message: 'Valor na moeda original deve ser maior ou igual a zero' })
  valorTituloMoedaOriginal?: number;

  /**
   * Valor do título convertido para moeda padrão (BRL)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor na moeda padrão deve ser um número' })
  @Min(0, { message: 'Valor na moeda padrão deve ser maior ou igual a zero' })
  valorTituloMoedaPadrao?: number;

  /**
   * Quantidade de parcelas (calculado automaticamente, mas pode ser informado)
   */
  @IsOptional()
  @IsInt({ message: 'Quantidade de parcelas deve ser um número inteiro' })
  @Min(1, { message: 'Quantidade de parcelas deve ser no mínimo 1' })
  quantidadeParcelas?: number;

  /**
   * Observações sobre o título
   */
  @IsOptional()
  @IsString({ message: 'Observação deve ser uma string' })
  observacao?: string;

  /**
   * Se o título está sujeito a imposto de renda
   */
  @IsOptional()
  @IsBoolean({ message: 'Imposto de renda deve ser um valor booleano' })
  impostoRenda?: boolean;

  /**
   * ID da conta bancária
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  contaBancariaId?: number;

  /**
   * Status do título
   */
  @IsOptional()
  @IsEnum(StatusTituloReceber, { message: 'Status deve ser ABERTO, PARCIAL, BAIXADO ou CANCELADO' })
  status?: StatusTituloReceber;
}
