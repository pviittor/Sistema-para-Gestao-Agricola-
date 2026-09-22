import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsNumber,
  Min,
  MinLength,
  MaxLength,
  Matches,
  Validate,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';
import { TipoConta } from '../../../models/Conta';

/**
 * CreateContaDto - DTO para criação de conta
 * 
 * DTO usado no endpoint de criação de conta com todas as validações necessárias.
 */
export class CreateContaDto extends CreateDto {
  /**
   * ID do banco
   */
  @IsInt({ message: 'ID do banco deve ser um número inteiro' })
  @Min(1, { message: 'ID do banco deve ser maior que zero' })
  @IsNotEmpty({ message: 'ID do banco é obrigatório' })
  @Validate(IsExists, ['ListaBanco', 'id'], { message: 'Banco não encontrado' })
  bancoId!: number;

  /**
   * Nome da conta
   */
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  nome!: string;

  /**
   * Agência da conta
   */
  @IsOptional()
  @IsString({ message: 'Agência deve ser uma string' })
  @MaxLength(50, { message: 'Agência deve ter no máximo 50 caracteres' })
  agencia?: string;

  /**
   * Número da conta
   */
  @IsOptional()
  @IsString({ message: 'Número da conta deve ser uma string' })
  @MaxLength(50, { message: 'Número da conta deve ter no máximo 50 caracteres' })
  conta?: string;

  /**
   * Tipo de conta (BANCO ou CAIXA)
   */
  @IsEnum(TipoConta, { message: 'Tipo deve ser BANCO ou CAIXA' })
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  tipo!: TipoConta;

  /**
   * Saldo inicial da conta
   */
  @IsOptional()
  @IsNumber({}, { message: 'Saldo inicial deve ser um número' })
  @Min(0, { message: 'Saldo inicial deve ser maior ou igual a zero' })
  saldoInicial?: number;

  /**
   * Se a conta está ativa
   */
  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um valor booleano' })
  ativo?: boolean;
}
