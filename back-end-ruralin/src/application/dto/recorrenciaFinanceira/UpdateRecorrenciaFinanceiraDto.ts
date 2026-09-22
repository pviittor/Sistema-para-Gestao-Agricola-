import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsIn,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdateRecorrenciaFinanceiraDto - DTO para atualização de recorrência financeira
 *
 * DTO usado no endpoint de atualização de recorrência financeira.
 * Todos os campos são opcionais.
 */
export class UpdateRecorrenciaFinanceiraDto extends UpdateDto {
  /**
   * Tipo da recorrência (PAGAR ou RECEBER)
   */
  @IsOptional()
  @IsIn(['PAGAR', 'RECEBER'], { message: 'Tipo deve ser PAGAR ou RECEBER' })
  tipo?: string;

  /**
   * Descrição da recorrência
   */
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  descricao?: string;

  /**
   * Valor base de cada lançamento gerado
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor deve ser um número' })
  @Min(0.01, { message: 'Valor deve ser maior que zero' })
  valor?: number;

  /**
   * Periodicidade dos lançamentos
   */
  @IsOptional()
  @IsIn(['SEMANAL', 'QUINZENAL', 'MENSAL', 'BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL', 'SAFRA'], {
    message: 'Periodicidade deve ser SEMANAL, QUINZENAL, MENSAL, BIMESTRAL, TRIMESTRAL, SEMESTRAL, ANUAL ou SAFRA',
  })
  periodicidade?: string;

  /**
   * Dia do mês de vencimento (1-31)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Dia de vencimento deve ser um número' })
  @Min(1, { message: 'Dia de vencimento deve ser no mínimo 1' })
  @Max(31, { message: 'Dia de vencimento deve ser no máximo 31' })
  diaVencimento?: number;

  /**
   * Data de início da vigência
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data de início deve ser uma data válida no formato YYYY-MM-DD' })
  dataInicio?: string;

  /**
   * Data de encerramento (null = indefinida)
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data de fim deve ser uma data válida no formato YYYY-MM-DD' })
  dataFim?: string;

  /**
   * Indica se está ativa para geração automática
   */
  @IsOptional()
  @IsBoolean({ message: 'Ativa deve ser um valor booleano' })
  ativa?: boolean;

  /**
   * ID do fornecedor/cliente (pessoa vinculada)
   */
  @IsOptional()
  @IsInt({ message: 'ID do fornecedor/cliente deve ser um número inteiro' })
  @Min(1, { message: 'ID do fornecedor/cliente deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Fornecedor/cliente não encontrado' })
  idFornecedorCliente?: number;

  /**
   * ID do portador (pessoa portadora)
   */
  @IsOptional()
  @IsInt({ message: 'ID do portador deve ser um número inteiro' })
  @Min(1, { message: 'ID do portador deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Portador não encontrado' })
  idPortador?: number;

  /**
   * ID do produtor (pessoa produtora)
   */
  @IsOptional()
  @IsInt({ message: 'ID do produtor deve ser um número inteiro' })
  @Min(1, { message: 'ID do produtor deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Produtor não encontrado' })
  idProdutor?: number;

  /**
   * ID da conta bancária/caixa padrão
   */
  @IsOptional()
  @IsInt({ message: 'ID da conta deve ser um número inteiro' })
  @Min(1, { message: 'ID da conta deve ser maior que zero' })
  @Validate(IsExists, ['Conta', 'id'], { message: 'Conta não encontrada' })
  idContaDebCred?: number;

  /**
   * ID do plano de conta gerencial padrão
   */
  @IsOptional()
  @IsInt({ message: 'ID do plano de conta gerencial deve ser um número inteiro' })
  @Min(1, { message: 'ID do plano de conta gerencial deve ser maior que zero' })
  @Validate(IsExists, ['PlanoContaGerencial', 'id'], { message: 'Plano de conta gerencial não encontrado' })
  idPlanoContaGerencial?: number;

  /**
   * ID do centro de custo padrão
   */
  @IsOptional()
  @IsInt({ message: 'ID do centro de custo deve ser um número inteiro' })
  @Min(1, { message: 'ID do centro de custo deve ser maior que zero' })
  @Validate(IsExists, ['CentroCusto', 'id'], { message: 'Centro de custo não encontrado' })
  idCentroCusto?: number;

  /**
   * ID da fazenda vinculada
   */
  @IsOptional()
  @IsInt({ message: 'ID da fazenda deve ser um número inteiro' })
  @Min(1, { message: 'ID da fazenda deve ser maior que zero' })
  @Validate(IsExists, ['Fazenda', 'id'], { message: 'Fazenda não encontrada' })
  idFazenda?: number;

  /**
   * ID da safra vinculada
   */
  @IsOptional()
  @IsInt({ message: 'ID da safra deve ser um número inteiro' })
  @Min(1, { message: 'ID da safra deve ser maior que zero' })
  @Validate(IsExists, ['Safra', 'id'], { message: 'Safra não encontrada' })
  idSafra?: number;

  /**
   * ID do talhão vinculado
   */
  @IsOptional()
  @IsInt({ message: 'ID do talhão deve ser um número inteiro' })
  @Min(1, { message: 'ID do talhão deve ser maior que zero' })
  @Validate(IsExists, ['Talhao', 'id_talhao'], { message: 'Talhão não encontrado' })
  idTalhao?: number;

  /**
   * ID da moeda dos lançamentos
   */
  @IsOptional()
  @IsInt({ message: 'ID da moeda deve ser um número inteiro' })
  @Min(1, { message: 'ID da moeda deve ser maior que zero' })
  @Validate(IsExists, ['Moeda', 'id_moeda'], { message: 'Moeda não encontrada' })
  idMoeda?: number;

  /**
   * Dias de antecedência para geração automática
   */
  @IsOptional()
  @IsInt({ message: 'Antecedência de geração deve ser um número inteiro' })
  @Min(0, { message: 'Antecedência de geração deve ser maior ou igual a zero' })
  antecedenciaGeracaoDias?: number;

  /**
   * Máximo de títulos a gerar (null = ilimitado)
   */
  @IsOptional()
  @IsInt({ message: 'Número máximo de gerações deve ser um número inteiro' })
  @Min(1, { message: 'Número máximo de gerações deve ser no mínimo 1' })
  numeroMaximoGeracoes?: number;

  /**
   * Observações adicionais
   */
  @IsOptional()
  @IsString({ message: 'Observação deve ser uma string' })
  observacao?: string;
}
