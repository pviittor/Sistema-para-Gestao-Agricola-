import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
  Min,
  IsNotEmpty,
  Validate,
  IsEnum,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';
import { StatusLancamentoRecorrente } from '../../../models/LancamentoRecorrente';

/**
 * CreateLancamentoRecorrenteDto - DTO para criacao de lancamento recorrente
 *
 * DTO usado no endpoint de criacao de lancamento recorrente com todas as validacoes necessarias.
 */
export class CreateLancamentoRecorrenteDto extends CreateDto {
  /**
   * ID da recorrencia financeira associada
   */
  @IsInt({ message: 'ID da recorrencia financeira deve ser um numero inteiro' })
  @Min(1, { message: 'ID da recorrencia financeira deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID da recorrencia financeira e obrigatorio' })
  @Validate(IsExists, ['RecorrenciaFinanceira', 'id'], { message: 'Recorrencia financeira nao encontrada' })
  recorrenciaFinanceiraId!: number;

  /**
   * ID do titulo a pagar gerado (quando tipo=PAGAR)
   */
  @IsOptional()
  @IsInt({ message: 'ID do titulo a pagar deve ser um numero inteiro' })
  @Min(1, { message: 'ID do titulo a pagar deve ser maior que zero' })
  @Validate(IsExists, ['TituloPagar', 'id'], { message: 'Titulo a pagar nao encontrado' })
  tituloPagarId?: number;

  /**
   * ID do titulo a receber gerado (quando tipo=RECEBER)
   */
  @IsOptional()
  @IsInt({ message: 'ID do titulo a receber deve ser um numero inteiro' })
  @Min(1, { message: 'ID do titulo a receber deve ser maior que zero' })
  @Validate(IsExists, ['TituloReceber', 'id'], { message: 'Titulo a receber nao encontrado' })
  tituloReceberId?: number;

  /**
   * Data de referencia (mes/periodo de competencia)
   */
  @IsDateString({}, { message: 'Data de referencia deve ser uma data valida no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data de referencia e obrigatoria' })
  dataReferencia!: string;

  /**
   * Data de vencimento efetiva gerada
   */
  @IsDateString({}, { message: 'Data de vencimento gerado deve ser uma data valida no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data de vencimento gerado e obrigatoria' })
  dataVencimentoGerado!: string;

  /**
   * Valor do titulo gerado
   */
  @IsNumber({}, { message: 'Valor gerado deve ser um numero' })
  @Min(0.01, { message: 'Valor gerado deve ser maior que zero' })
  @IsNotEmpty({ message: 'Valor gerado e obrigatorio' })
  valorGerado!: number;

  /**
   * Status do lancamento
   */
  @IsOptional()
  @IsEnum(StatusLancamentoRecorrente, { message: 'Status deve ser GERADO ou CANCELADO' })
  status?: StatusLancamentoRecorrente;

  /**
   * Observacao sobre a geracao
   */
  @IsOptional()
  @IsString({ message: 'Observacao deve ser uma string' })
  observacao?: string;
}
