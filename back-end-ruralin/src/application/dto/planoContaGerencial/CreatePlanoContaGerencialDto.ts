import {
  IsString,
  IsInt,
  IsNotEmpty,
  Validate,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsEnum,
  IsOptional,
  Matches,
  IsBoolean,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * CreatePlanoContaGerencialDto - DTO para criação de conta do plano de contas gerencial
 */
export class CreatePlanoContaGerencialDto extends CreateDto {
  /**
   * Sequência lógica de números indicando os níveis da conta (ex: 1.0.0.0, 1.1.0.0, 1.1.1.0, 1.1.2.0)
   */
  @IsString({ message: 'Item deve ser uma string' })
  @IsNotEmpty({ message: 'Item é obrigatório' })
  @MinLength(3, { message: 'Item deve ter no mínimo 3 caracteres' })
  @MaxLength(50, { message: 'Item deve ter no máximo 50 caracteres' })
  @Matches(/^\d+\.(\d+\.(\d+\.\d+)?)?$/, {
    message: 'Item deve seguir o formato de 4 níveis (ex: 1.0.0.0, 1.1.0.0, 1.1.1.0, 1.1.2.0)',
  })
  item!: string;

  /**
   * Descrição da conta (livre digitação)
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MinLength(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição deve ter no máximo 255 caracteres' })
  descricao!: string;

  /**
   * Tipo da conta: Sintética ou Analítica
   */
  @IsEnum(['SINTETICA', 'ANALITICA'], {
    message: 'Tipo deve ser SINTETICA ou ANALITICA',
  })
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  tipo!: 'SINTETICA' | 'ANALITICA';

  /**
   * Tipo de fluxo financeiro: RECEITA ou DESPESA
   */
  @IsEnum(['RECEITA', 'DESPESA'], {
    message: 'Tipo de fluxo deve ser RECEITA ou DESPESA',
  })
  @IsNotEmpty({ message: 'Tipo de fluxo é obrigatório' })
  tipoFluxo!: 'RECEITA' | 'DESPESA';

  /**
   * Classificação da conta (cadastro de classificação)
   */
  @IsString({ message: 'Classificação deve ser uma string' })
  @MaxLength(100, { message: 'Classificação deve ter no máximo 100 caracteres' })
  @IsOptional()
  classificacao?: string;

  /**
   * ID da conta pai (para hierarquia). NULL para contas de primeiro nível
   */
  @IsInt({ message: 'ID da conta pai deve ser um número inteiro' })
  @Min(1, { message: 'ID da conta pai deve ser maior que zero' })
  @Validate(IsExists, ['PlanoContaGerencial', 'id'])
  @IsOptional()
  contaPaiId?: number;

  /**
   * Nível hierárquico da conta (1 a 4)
   */
  @IsInt({ message: 'Nível deve ser um número inteiro' })
  @Min(1, { message: 'Nível deve ser no mínimo 1' })
  @Max(4, { message: 'Nível deve ser no máximo 4' })
  @IsOptional()
  nivel?: number;

  /**
   * Se a conta está ativa
   */
  @IsBoolean({ message: 'Ativo deve ser um booleano' })
  @IsOptional()
  ativo?: boolean;
}
