import {
  IsInt,
  IsNumber,
  IsString,
  IsDateString,
  IsOptional,
  Min,
  Validate,
  ValidateIf,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
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
 * UpdateOutraDespesaReceitaDto - DTO para atualizacao de outra despesa/receita
 *
 * Todos os campos sao opcionais, permitindo atualizacoes parciais.
 *
 * @example
 * ```typescript
 * // PUT /api/outras-despesas-receitas/:id
 * {
 *   "valor": 200.00,
 *   "observacoes": "Valor atualizado"
 * }
 * ```
 */
export class UpdateOutraDespesaReceitaDto extends UpdateDto {
  /**
   * ID do plano de conta gerencial
   * Deve existir no banco de dados
   */
  @IsOptional()
  @IsInt({ message: 'Plano Gerencial ID deve ser um numero inteiro' })
  @Min(1, { message: 'Plano Gerencial ID deve ser maior que zero' })
  @Validate(IsExists, ['PlanoContaGerencial', 'id'], { message: 'Plano de conta gerencial nao encontrado' })
  planoGerencialId?: number;

  /**
   * Data do movimento (formato: YYYY-MM-DD)
   */
  @IsOptional()
  @IsDateString({}, { message: 'Data do movimento deve ser uma data valida no formato YYYY-MM-DD' })
  dataMovimento?: string;

  /**
   * Valor da despesa/receita (minimo 0.01)
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor deve ser um numero' })
  @Min(0.01, { message: 'Valor deve ser maior que zero' })
  valor?: number;

  /**
   * Observacoes gerais
   */
  @IsOptional()
  @IsString({ message: 'Observacoes deve ser uma string' })
  observacoes?: string;

  /**
   * Tipo do lancamento: RECEITA ou DESPESA
   */
  @IsOptional()
  @IsString({ message: 'Tipo deve ser uma string' })
  @IsValidEnum(TipoOutraDespesaReceita, { message: 'Tipo deve ser RECEITA ou DESPESA' })
  tipo?: string;

  /**
   * Tipo de alocacao: PROPRIEDADE ou CONFIGURADOR_CICLO
   */
  @IsOptional()
  @IsString({ message: 'Tipo de alocacao deve ser uma string' })
  @IsValidEnum(TipoAlocacao, { message: 'Tipo de alocacao deve ser PROPRIEDADE ou CONFIGURADOR_CICLO' })
  tipoAlocacao?: string;

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
