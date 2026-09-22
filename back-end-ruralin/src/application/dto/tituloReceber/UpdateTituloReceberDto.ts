import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDateString,
  IsNumber,
  Min,
  MaxLength,
  Validate,
  IsEnum,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';
import { IsUnique } from '../../validators/IsUnique';
import { StatusTituloReceber } from '../../../models/TituloReceber';

/**
 * UpdateTituloReceberDto - DTO para atualização de título a receber
 * 
 * DTO usado no endpoint de atualização de título a receber.
 * Todos os campos são opcionais.
 */
export class UpdateTituloReceberDto extends UpdateDto {
  /**
   * ID do cliente (pessoa marcada como cliente)
   */
  @IsOptional()
  @IsInt({ message: 'ID do cliente deve ser um número inteiro' })
  @Min(1, { message: 'ID do cliente deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Cliente não encontrado' })
  idCliente?: number;

  /**
   * ID do portador (pessoa marcada como portador)
   */
  @IsOptional()
  @IsInt({ message: 'ID do portador deve ser um número inteiro' })
  @Min(1, { message: 'ID do portador deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Portador não encontrado' })
  idPortador?: number;

  /**
   * ID do produtor (pessoa marcada como produtor)
   */
  @IsOptional()
  @IsInt({ message: 'ID do produtor deve ser um número inteiro' })
  @Min(1, { message: 'ID do produtor deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Produtor não encontrado' })
  idProdutor?: number;

  /**
   * ID da fazenda
   */
  @IsOptional()
  @IsInt({ message: 'ID da fazenda deve ser um número inteiro' })
  @Min(1, { message: 'ID da fazenda deve ser maior que zero' })
  @Validate(IsExists, ['Fazenda', 'id'], { message: 'Fazenda não encontrada' })
  idFazenda?: number;

  /**
   * ID da safra
   */
  @IsOptional()
  @IsInt({ message: 'ID da safra deve ser um número inteiro' })
  @Min(1, { message: 'ID da safra deve ser maior que zero' })
  @Validate(IsExists, ['Safra', 'id'], { message: 'Safra não encontrada' })
  idSafra?: number;

  /**
   * ID da moeda
   */
  @IsOptional()
  @IsInt({ message: 'ID da moeda deve ser um número inteiro' })
  @Min(1, { message: 'ID da moeda deve ser maior que zero' })
  @Validate(IsExists, ['Moeda', 'id_moeda'], { message: 'Moeda não encontrada' })
  idMoeda?: number;

  /**
   * Data de lançamento do título
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data de lançamento deve ser uma data válida no formato YYYY-MM-DD' })
  dataLancamento?: string;

  /**
   * Número do título (único por tenant)
   */
  @IsOptional()
  @IsString({ message: 'Número do título deve ser uma string' })
  @MaxLength(100, { message: 'Número do título deve ter no máximo 100 caracteres' })
  @IsUnique('TituloReceber', 'numeroTitulo', 'id', { message: 'Já existe um título com este número para este tenant' })
  numeroTitulo?: string;

  /**
   * Valor total do título (soma de todas as parcelas)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor do título deve ser um número' })
  @Min(0.01, { message: 'Valor do título deve ser maior que zero' })
  valorTitulo?: number;

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
   * Quantidade de parcelas
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
  @IsInt({ message: 'ID da conta bancária deve ser um número inteiro' })
  @Min(1, { message: 'ID da conta bancária deve ser maior que zero' })
  contaBancariaId?: number;

  /**
   * Status do título
   */
  @IsOptional()
  @IsEnum(StatusTituloReceber, { message: 'Status deve ser ABERTO, PARCIAL, BAIXADO ou CANCELADO' })
  status?: StatusTituloReceber;
}
