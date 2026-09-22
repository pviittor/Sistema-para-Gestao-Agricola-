import {
  IsString,
  IsNumber,
  IsOptional,
  Validate,
  MaxLength,
  Min,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';
import { IsValidEnum } from '../../validators/IsValidEnum';
import { TipoRegistroArmazenagem } from '../../../models/enums/RegistroArmazenagemEnums';

/**
 * UpdateRegistroArmazenagemDto - DTO para atualização de registro de armazenagem
 */
export class UpdateRegistroArmazenagemDto extends UpdateDto {
  /**
   * Tipo do registro (Carga ou Descarga)
   */
  @IsOptional()
  @IsValidEnum(TipoRegistroArmazenagem, { message: 'Tipo deve ser Carga ou Descarga' })
  tipo?: string;

  /**
   * Data do registro
   */
  @IsOptional()
  @IsString({ message: 'Data deve ser uma string' })
  data?: string;

  /**
   * Hora do registro
   */
  @IsOptional()
  @IsString({ message: 'Hora deve ser uma string' })
  hora?: string;

  /**
   * ID do produto
   */
  @IsOptional()
  @IsNumber({}, { message: 'ID do produto deve ser um número' })
  @Min(1, { message: 'ID do produto deve ser maior que zero' })
  @Validate(IsExists, ['Produto', 'id_prod'], { message: 'Produto não encontrado' })
  idProduto?: number;

  /**
   * ID da unidade de medida
   */
  @IsOptional()
  @IsNumber({}, { message: 'ID da unidade de medida deve ser um número' })
  @Min(1, { message: 'ID da unidade de medida deve ser maior que zero' })
  @Validate(IsExists, ['UnidadeMedida', 'id_unidade'], { message: 'Unidade de medida não encontrada' })
  idUnidadeMedida?: number;

  /**
   * ID da origem (configurador de ciclo)
   */
  @IsOptional()
  @IsNumber({}, { message: 'ID da origem deve ser um número' })
  @Min(1, { message: 'ID da origem deve ser maior que zero' })
  @Validate(IsExists, ['ConfiguradorCiclo', 'id_cfg'], { message: 'Origem (configurador de ciclo) não encontrada' })
  idOrigem?: number;

  /**
   * ID da unidade de depósito
   */
  @IsOptional()
  @IsNumber({}, { message: 'ID da unidade de depósito deve ser um número' })
  @Min(1, { message: 'ID da unidade de depósito deve ser maior que zero' })
  @Validate(IsExists, ['UnidadeDeposito', 'id'], { message: 'Unidade de depósito não encontrada' })
  idUnidadeDeposito?: number;

  /**
   * ID do motorista (pessoa)
   */
  @IsOptional()
  @IsNumber({}, { message: 'ID do motorista deve ser um número' })
  @Min(1, { message: 'ID do motorista deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Motorista não encontrado' })
  idMotorista?: number;

  /**
   * Número do ticket
   */
  @IsOptional()
  @IsString({ message: 'Ticket deve ser uma string' })
  @MaxLength(100, { message: 'Ticket deve ter no máximo 100 caracteres' })
  ticket?: string;

  /**
   * Placa do veículo
   */
  @IsOptional()
  @IsString({ message: 'Placa deve ser uma string' })
  @MaxLength(20, { message: 'Placa deve ter no máximo 20 caracteres' })
  placa?: string;

  /**
   * Peso bruto
   */
  @IsOptional()
  @IsNumber({}, { message: 'Peso bruto deve ser um número' })
  @Min(0, { message: 'Peso bruto deve ser maior ou igual a zero' })
  peso_bruto?: number;

  /**
   * Peso tara
   */
  @IsOptional()
  @IsNumber({}, { message: 'Peso tara deve ser um número' })
  @Min(0, { message: 'Peso tara deve ser maior ou igual a zero' })
  peso_tara?: number;

  /**
   * Peso líquido
   */
  @IsOptional()
  @IsNumber({}, { message: 'Peso líquido deve ser um número' })
  @Min(0, { message: 'Peso líquido deve ser maior ou igual a zero' })
  peso_liquido?: number;

  /**
   * Desconto por umidade
   */
  @IsOptional()
  @IsNumber({}, { message: 'Desconto por umidade deve ser um número' })
  @Min(0, { message: 'Desconto por umidade deve ser maior ou igual a zero' })
  desconto_umidade?: number;

  /**
   * Desconto por impureza
   */
  @IsOptional()
  @IsNumber({}, { message: 'Desconto por impureza deve ser um número' })
  @Min(0, { message: 'Desconto por impureza deve ser maior ou igual a zero' })
  desconto_impureza?: number;

  /**
   * Desconto por avariados
   */
  @IsOptional()
  @IsNumber({}, { message: 'Desconto por avariados deve ser um número' })
  @Min(0, { message: 'Desconto por avariados deve ser maior ou igual a zero' })
  desconto_avariados?: number;

  /**
   * Desconto por esverdeados
   */
  @IsOptional()
  @IsNumber({}, { message: 'Desconto por esverdeados deve ser um número' })
  @Min(0, { message: 'Desconto por esverdeados deve ser maior ou igual a zero' })
  desconto_esverdeados?: number;

  /**
   * Desconto por quebra técnica
   */
  @IsOptional()
  @IsNumber({}, { message: 'Desconto por quebra técnica deve ser um número' })
  @Min(0, { message: 'Desconto por quebra técnica deve ser maior ou igual a zero' })
  desconto_quebra_tecnica?: number;

  /**
   * Desconto por taxa de recepção
   */
  @IsOptional()
  @IsNumber({}, { message: 'Desconto por taxa de recepção deve ser um número' })
  @Min(0, { message: 'Desconto por taxa de recepção deve ser maior ou igual a zero' })
  desconto_taxa_recepcao?: number;

  /**
   * Observações
   */
  @IsOptional()
  @IsString({ message: 'Observações deve ser uma string' })
  observacoes?: string;
}
