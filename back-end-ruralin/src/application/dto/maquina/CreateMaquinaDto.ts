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
  IsNotEmpty,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';
import { IsValidEnum } from '../../validators/IsValidEnum';
import { TipoMarcador, CombustivelTipo, TipoMaquina } from '../../../models/enums/MaquinaEnums';

/**
 * CreateMaquinaDto - DTO para criacao de maquina
 */
export class CreateMaquinaDto extends CreateDto {
  // ===== Identificacao =====

  /**
   * Descricao da maquina
   */
  @IsString({ message: 'Descricao deve ser uma string' })
  @IsNotEmpty({ message: 'Descricao e obrigatoria' })
  @MaxLength(255, { message: 'Descricao deve ter no maximo 255 caracteres' })
  descricao!: string;

  /**
   * Chassi da maquina
   */
  @IsOptional()
  @IsString({ message: 'Chassi deve ser uma string' })
  @MaxLength(100, { message: 'Chassi deve ter no maximo 100 caracteres' })
  chassi?: string;

  /**
   * Placa da maquina
   */
  @IsOptional()
  @IsString({ message: 'Placa deve ser uma string' })
  @MaxLength(20, { message: 'Placa deve ter no maximo 20 caracteres' })
  placa?: string;

  /**
   * Ano da maquina
   */
  @IsOptional()
  @IsInt({ message: 'Ano deve ser um numero inteiro' })
  @Min(1900, { message: 'Ano deve ser maior ou igual a 1900' })
  ano?: number;

  /**
   * Modelo da maquina
   */
  @IsOptional()
  @IsString({ message: 'Modelo deve ser uma string' })
  @MaxLength(100, { message: 'Modelo deve ter no maximo 100 caracteres' })
  modelo?: string;

  /**
   * Serie da maquina
   */
  @IsOptional()
  @IsString({ message: 'Serie deve ser uma string' })
  @MaxLength(100, { message: 'Serie deve ter no maximo 100 caracteres' })
  serie?: string;

  /**
   * Marca da maquina
   */
  @IsOptional()
  @IsString({ message: 'Marca deve ser uma string' })
  @MaxLength(100, { message: 'Marca deve ter no maximo 100 caracteres' })
  marca?: string;

  // ===== Classificacao =====

  /**
   * ID do grupo de equipamento
   */
  @IsOptional()
  @IsInt({ message: 'ID do grupo de equipamento deve ser um numero inteiro' })
  @Min(1, { message: 'ID do grupo de equipamento deve ser maior que zero' })
  @Validate(IsExists, ['GrupoEquipamento', 'id_grpequip'], { message: 'Grupo de equipamento nao encontrado' })
  idGrupoEquipamento?: number;

  /**
   * Tipo de marcador (HORIMETRO, ODOMETRO, NENHUM)
   */
  @IsOptional()
  @IsValidEnum(TipoMarcador, { message: 'Tipo de marcador deve ser HORIMETRO (1), ODOMETRO (2) ou NENHUM (3)' })
  tipoMarcador?: number;

  /**
   * Tipo de combustivel
   */
  @IsOptional()
  @IsValidEnum(CombustivelTipo, { message: 'Tipo de combustivel invalido' })
  combustivel?: number;

  /**
   * Tipo de maquina (MAQUINA, VEICULO, IMPLEMENTO)
   */
  @IsOptional()
  @IsValidEnum(TipoMaquina, { message: 'Tipo de maquina deve ser MAQUINA (1), VEICULO (2) ou IMPLEMENTO (3)' })
  tipo?: number;

  // ===== Aquisicao =====

  /**
   * Data de aquisicao
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data de aquisicao deve ser uma data valida no formato YYYY-MM-DD' })
  dataAquisicao?: string;

  /**
   * Valor de aquisicao
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor de aquisicao deve ser um numero' })
  @Min(0, { message: 'Valor de aquisicao deve ser maior ou igual a zero' })
  valorAquisicao?: number;

  /**
   * Valor atual
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor atual deve ser um numero' })
  @Min(0, { message: 'Valor atual deve ser maior ou igual a zero' })
  valorAtual?: number;

  /**
   * ID do fornecedor (pessoa)
   */
  @IsOptional()
  @IsInt({ message: 'ID do fornecedor deve ser um numero inteiro' })
  @Min(1, { message: 'ID do fornecedor deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Fornecedor nao encontrado' })
  idFornecedor?: number;

  /**
   * Nota fiscal
   */
  @IsOptional()
  @IsString({ message: 'Nota fiscal deve ser uma string' })
  @MaxLength(50, { message: 'Nota fiscal deve ter no maximo 50 caracteres' })
  notaFiscal?: string;

  /**
   * Serie da nota fiscal
   */
  @IsOptional()
  @IsString({ message: 'Serie da nota fiscal deve ser uma string' })
  @MaxLength(20, { message: 'Serie da nota fiscal deve ter no maximo 20 caracteres' })
  serieNotaFiscal?: string;

  /**
   * Data da nota fiscal
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data da nota fiscal deve ser uma data valida no formato YYYY-MM-DD' })
  dataNotaFiscal?: string;

  // ===== Depreciacao =====

  /**
   * Vida util (anos)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Vida util deve ser um numero' })
  @Min(0, { message: 'Vida util deve ser maior ou igual a zero' })
  vidaUtil?: number;

  /**
   * Percentual de sucata
   */
  @IsOptional()
  @IsNumber({}, { message: 'Percentual de sucata deve ser um numero' })
  @Min(0, { message: 'Percentual de sucata deve ser maior ou igual a zero' })
  percsucata?: number;

  /**
   * Depreciacao anual
   */
  @IsOptional()
  @IsNumber({}, { message: 'Depreciacao anual deve ser um numero' })
  @Min(0, { message: 'Depreciacao anual deve ser maior ou igual a zero' })
  depreciacaoAnual?: number;

  /**
   * Hora util por ano
   */
  @IsOptional()
  @IsNumber({}, { message: 'Hora util por ano deve ser um numero' })
  @Min(0, { message: 'Hora util por ano deve ser maior ou igual a zero' })
  horaUtilAno?: number;

  // ===== Horimetros =====

  /**
   * Horimetro inicial
   */
  @IsOptional()
  @IsNumber({}, { message: 'Horimetro inicial deve ser um numero' })
  @Min(0, { message: 'Horimetro inicial deve ser maior ou igual a zero' })
  horimetroInicial?: number;

  /**
   * Ultimo horimetro
   */
  @IsOptional()
  @IsNumber({}, { message: 'Ultimo horimetro deve ser um numero' })
  @Min(0, { message: 'Ultimo horimetro deve ser maior ou igual a zero' })
  ultimoHorimetro?: number;

  /**
   * Horimetro de abastecimento
   */
  @IsOptional()
  @IsNumber({}, { message: 'Horimetro de abastecimento deve ser um numero' })
  @Min(0, { message: 'Horimetro de abastecimento deve ser maior ou igual a zero' })
  horimetroAbastecimento?: number;

  /**
   * Horimetro de manutencao
   */
  @IsOptional()
  @IsNumber({}, { message: 'Horimetro de manutencao deve ser um numero' })
  @Min(0, { message: 'Horimetro de manutencao deve ser maior ou igual a zero' })
  horimetroManutencao?: number;

  /**
   * Horimetro de apontamento
   */
  @IsOptional()
  @IsNumber({}, { message: 'Horimetro de apontamento deve ser um numero' })
  @Min(0, { message: 'Horimetro de apontamento deve ser maior ou igual a zero' })
  horimetroApontamento?: number;

  // ===== Custo =====

  /**
   * Custo fixo (boolean)
   */
  @IsOptional()
  @IsBoolean({ message: 'Custo fixo deve ser um valor booleano' })
  custoFixo?: boolean;

  /**
   * Valor do custo fixo
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor do custo fixo deve ser um numero' })
  @Min(0, { message: 'Valor do custo fixo deve ser maior ou igual a zero' })
  valorCustoFixo?: number;

  /**
   * Valor do consumo fixo
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor do consumo fixo deve ser um numero' })
  @Min(0, { message: 'Valor do consumo fixo deve ser maior ou igual a zero' })
  valorConsumoFixo?: number;

  /**
   * Custo depreciacao (boolean)
   */
  @IsOptional()
  @IsBoolean({ message: 'Custo depreciacao deve ser um valor booleano' })
  custoDepreciacao?: boolean;

  /**
   * Valor hora depreciacao
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor hora depreciacao deve ser um numero' })
  @Min(0, { message: 'Valor hora depreciacao deve ser maior ou igual a zero' })
  valorHoraDepreciacao?: number;

  /**
   * Custo manutencao (boolean)
   */
  @IsOptional()
  @IsBoolean({ message: 'Custo manutencao deve ser um valor booleano' })
  custoManutencao?: boolean;

  /**
   * Custo combustivel (boolean)
   */
  @IsOptional()
  @IsBoolean({ message: 'Custo combustivel deve ser um valor booleano' })
  custoCombustivel?: boolean;

  /**
   * Valor hora
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor hora deve ser um numero' })
  @Min(0, { message: 'Valor hora deve ser maior ou igual a zero' })
  valorHora?: number;

  // ===== Combustivel =====

  /**
   * Consumo estimado de combustivel
   */
  @IsOptional()
  @IsNumber({}, { message: 'Consumo estimado de combustivel deve ser um numero' })
  @Min(0, { message: 'Consumo estimado de combustivel deve ser maior ou igual a zero' })
  consumoEstimadoCombustivel?: number;

  /**
   * ID do produto combustivel
   */
  @IsOptional()
  @IsInt({ message: 'ID do combustivel deve ser um numero inteiro' })
  @Min(1, { message: 'ID do combustivel deve ser maior que zero' })
  @Validate(IsExists, ['Produto', 'id_prod'], { message: 'Produto combustivel nao encontrado' })
  idCombustivelMaquina?: number;

  // ===== Fazenda/Operacao =====

  /**
   * ID da fazenda
   */
  @IsOptional()
  @IsInt({ message: 'ID da fazenda deve ser um numero inteiro' })
  @Min(1, { message: 'ID da fazenda deve ser maior que zero' })
  @Validate(IsExists, ['Fazenda', 'id'], { message: 'Fazenda nao encontrada' })
  idFazenda?: number;

  /**
   * ID do motorista (pessoa)
   */
  @IsOptional()
  @IsInt({ message: 'ID do motorista deve ser um numero inteiro' })
  @Min(1, { message: 'ID do motorista deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Motorista nao encontrado' })
  idMotorista?: number;

  /**
   * Consumo por hectare
   */
  @IsOptional()
  @IsNumber({}, { message: 'Consumo por hectare deve ser um numero' })
  @Min(0, { message: 'Consumo por hectare deve ser maior ou igual a zero' })
  consumoHA?: number;

  /**
   * Custo por hectare
   */
  @IsOptional()
  @IsNumber({}, { message: 'Custo por hectare deve ser um numero' })
  @Min(0, { message: 'Custo por hectare deve ser maior ou igual a zero' })
  custoHA?: number;

  // ===== Pesagem =====

  /**
   * Tara (peso do veiculo vazio)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Tara deve ser um numero' })
  @Min(0, { message: 'Tara deve ser maior ou igual a zero' })
  tara?: number;

  /**
   * Utilizar tara na pesagem
   */
  @IsOptional()
  @IsBoolean({ message: 'Utilizar tara pesagem deve ser um valor booleano' })
  utilizarTaraPesagem?: boolean;

  // ===== Seguro =====

  /**
   * ID da seguradora (pessoa)
   */
  @IsOptional()
  @IsInt({ message: 'ID da seguradora deve ser um numero inteiro' })
  @Min(1, { message: 'ID da seguradora deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Seguradora nao encontrada' })
  idSeguradora?: number;

  /**
   * Data de inicio do seguro
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data de inicio do seguro deve ser uma data valida no formato YYYY-MM-DD' })
  inicioSeguro?: string;

  /**
   * Data de fim do seguro
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data de fim do seguro deve ser uma data valida no formato YYYY-MM-DD' })
  fimSeguro?: string;

  /**
   * Apolice do seguro
   */
  @IsOptional()
  @IsString({ message: 'Apolice deve ser uma string' })
  @MaxLength(100, { message: 'Apolice deve ter no maximo 100 caracteres' })
  aplice?: string;
}
