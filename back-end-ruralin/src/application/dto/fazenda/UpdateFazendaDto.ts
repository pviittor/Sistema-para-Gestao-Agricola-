import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDateString,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * DTO para atualização de Fazenda
 */
export class UpdateFazendaDto extends UpdateDto {
  /**
   * ID da pessoa (produtor) proprietária da fazenda
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Pessoa não encontrada' })
  idPessoa?: number;

  /**
   * Descrição/nome da fazenda
   */
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  descricao?: string;

  /**
   * Endereço da fazenda
   */
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Endereço deve ter no máximo 255 caracteres' })
  endereco?: string;

  /**
   * Complemento do endereço
   */
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Complemento deve ter no máximo 255 caracteres' })
  complemento?: string;

  /**
   * ID do município onde a fazenda está localizada
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Validate(IsExists, ['Municipio', 'id'], { message: 'Município não encontrado' })
  idMunicipio?: number;

  /**
   * Inscrição estadual da fazenda
   */
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Inscrição estadual deve ter no máximo 50 caracteres' })
  inscricaoEstadual?: string;

  /**
   * Área total da fazenda em hectares
   */
  @IsOptional()
  @IsNumber({}, { message: 'Área total deve ser um número' })
  @Min(0, { message: 'Área total deve ser maior ou igual a zero' })
  areaTotal?: number;

  /**
   * Área cultivada em hectares
   */
  @IsOptional()
  @IsNumber({}, { message: 'Área cultivada deve ser um número' })
  @Min(0, { message: 'Área cultivada deve ser maior ou igual a zero' })
  areaCultivada?: number;

  /**
   * Reserva legal em hectares
   */
  @IsOptional()
  @IsNumber({}, { message: 'Reserva legal deve ser um número' })
  @Min(0, { message: 'Reserva legal deve ser maior ou igual a zero' })
  reservaLegal?: number;

  /**
   * Telefone de contato da fazenda
   */
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Telefone deve ter no máximo 20 caracteres' })
  telefone?: string;

  /**
   * Nome do gerente da fazenda
   */
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Gerente deve ter no máximo 255 caracteres' })
  gerente?: string;

  /**
   * Matrícula do imóvel
   */
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Matrícula deve ter no máximo 50 caracteres' })
  matricula?: string;

  /**
   * Livro da matrícula
   */
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Livro deve ter no máximo 50 caracteres' })
  livro?: string;

  /**
   * Folha da matrícula
   */
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Folha deve ter no máximo 50 caracteres' })
  folha?: string;

  /**
   * ITR (Imposto Territorial Rural)
   */
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'ITR deve ter no máximo 50 caracteres' })
  itr?: string;

  /**
   * CEI (Cadastro Específico do INSS)
   */
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'CEI deve ter no máximo 50 caracteres' })
  cei?: string;

  /**
   * Tipo de exploração LCDPR (1-Exploração individual, 2-Condomínio, 3-Imóvel arrendado, 4-Parceria, 5-Comodato)
   */
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Tipo de exploração deve ser entre 1 e 5' })
  @Max(5, { message: 'Tipo de exploração deve ser entre 1 e 5' })
  lcdprTipoExploracao?: number;

  /**
   * Participação na exploração (percentual)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Participação LCDPR deve ser um número' })
  @Min(0, { message: 'Participação LCDPR deve ser maior ou igual a zero' })
  @Max(100, { message: 'Participação LCDPR deve ser menor ou igual a 100' })
  lcdprParticipacao?: number;

  /**
   * Se a fazenda é arrendada
   */
  @IsOptional()
  @IsBoolean()
  arrendada?: boolean;

  /**
   * ID da pessoa (arrendador) quando a fazenda é arrendada
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Pessoa arrendadora não encontrada' })
  idPessoaArrendamento?: number;

  /**
   * Documento do arrendamento
   */
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Documento deve ter no máximo 255 caracteres' })
  documento?: string;

  /**
   * Data de início do arrendamento
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data de início deve ser uma data válida no formato YYYY-MM-DD' })
  dataInicio?: string;

  /**
   * Data de fim do arrendamento
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data de fim deve ser uma data válida no formato YYYY-MM-DD' })
  dataFim?: string;

  /**
   * Observações gerais sobre a fazenda
   */
  @IsOptional()
  @IsString()
  observacoes?: string;

  /**
   * Se a fazenda movimenta LCDPR
   */
  @IsOptional()
  @IsBoolean()
  movimentaLCDPR?: boolean;

  /**
   * Se a fazenda movimenta gado
   */
  @IsOptional()
  @IsBoolean()
  movimentaGado?: boolean;
}
