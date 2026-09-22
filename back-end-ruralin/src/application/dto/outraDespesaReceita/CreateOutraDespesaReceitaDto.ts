import {
  IsInt,
  IsNumber,
  IsString,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  Min,
  Validate,
  ValidateIf,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';
import { IsValidEnum } from '../../validators/IsValidEnum';
import { IsRequiredIf } from '../../validators/IsRequiredIf';

/**
 * Enum para tipo do lancamento
 */
enum TipoOutraDespesaReceita {
  RECEITA = 'RECEITA',
  DESPESA = 'DESPESA',
}

/**
 * Enum para tipo de alocacao
 */
enum TipoAlocacao {
  PROPRIEDADE = 'PROPRIEDADE',
  CONFIGURADOR_CICLO = 'CONFIGURADOR_CICLO',
}

/**
 * CreateOutraDespesaReceitaDto - DTO para criacao de outra despesa/receita
 *
 * @example
 * ```typescript
 * // POST /api/outras-despesas-receitas
 * {
 *   "planoGerencialId": 1,
 *   "dataMovimento": "2026-03-01",
 *   "valor": 150.50,
 *   "observacoes": "Receita de venda avulsa",
 *   "tipo": "RECEITA",
 *   "tipoAlocacao": "PROPRIEDADE",
 *   "configuradorCicloId": null
 * }
 * ```
 */
export class CreateOutraDespesaReceitaDto extends CreateDto {
  /**
   * ID do plano de conta gerencial
   * Deve existir no banco de dados
   */
  @IsInt({ message: 'Plano Gerencial ID deve ser um numero inteiro' })
  @Min(1, { message: 'Plano Gerencial ID deve ser maior que zero' })
  @IsNotEmpty({ message: 'Plano Gerencial ID e obrigatorio' })
  @Validate(IsExists, ['PlanoContaGerencial', 'id'], { message: 'Plano de conta gerencial nao encontrado' })
  planoGerencialId!: number;

  /**
   * Data do movimento (formato: YYYY-MM-DD)
   */
  @IsDateString({}, { message: 'Data do movimento deve ser uma data valida no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data do movimento e obrigatoria' })
  dataMovimento!: string;

  /**
   * Valor da despesa/receita (minimo 0.01)
   */
  @IsNumber({}, { message: 'Valor deve ser um numero' })
  @Min(0.01, { message: 'Valor deve ser maior que zero' })
  @IsNotEmpty({ message: 'Valor e obrigatorio' })
  valor!: number;

  /**
   * Observacoes gerais
   */
  @IsOptional()
  @IsString({ message: 'Observacoes deve ser uma string' })
  observacoes?: string;

  /**
   * Tipo do lancamento: RECEITA ou DESPESA
   */
  @IsString({ message: 'Tipo deve ser uma string' })
  @IsNotEmpty({ message: 'Tipo e obrigatorio' })
  @IsValidEnum(TipoOutraDespesaReceita, { message: 'Tipo deve ser RECEITA ou DESPESA' })
  tipo!: string;

  /**
   * Tipo de alocacao: PROPRIEDADE ou CONFIGURADOR_CICLO
   */
  @IsString({ message: 'Tipo de alocacao deve ser uma string' })
  @IsNotEmpty({ message: 'Tipo de alocacao e obrigatorio' })
  @IsValidEnum(TipoAlocacao, { message: 'Tipo de alocacao deve ser PROPRIEDADE ou CONFIGURADOR_CICLO' })
  tipoAlocacao!: string;

  /**
   * ID do configurador de ciclo
   * Obrigatorio quando tipoAlocacao = CONFIGURADOR_CICLO
   * Deve ser null quando tipoAlocacao = PROPRIEDADE
   */
  @IsOptional()
  @ValidateIf((o) => o.configuradorCicloId !== undefined && o.configuradorCicloId !== null)
  @IsInt({ message: 'Configurador Ciclo ID deve ser um numero inteiro' })
  @Min(1, { message: 'Configurador Ciclo ID deve ser maior que zero' })
  @Validate(IsExists, ['ConfiguradorCiclo', 'id_cfg'], { message: 'Configurador de ciclo nao encontrado' })
  @IsRequiredIf('tipoAlocacao', 'CONFIGURADOR_CICLO', {
    message: 'Configurador Ciclo ID e obrigatorio quando tipo de alocacao e CONFIGURADOR_CICLO',
  })
  configuradorCicloId?: number;
}
