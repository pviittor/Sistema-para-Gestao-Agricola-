import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsNumber,
  Min,
  MinLength,
  MaxLength,
  IsEnum,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';
import { TipoConta } from '../../../models/Conta';

/**
 * UpdateContaDto - DTO para atualização de conta
 * 
 * DTO usado no endpoint de atualização de conta.
 * Todos os campos são opcionais.
 */
export class UpdateContaDto extends UpdateDto {
  /**
   * ID do banco
   */
  @IsOptional()
  @IsInt({ message: 'ID do banco deve ser um número inteiro' })
  @Min(1, { message: 'ID do banco deve ser maior que zero' })
  @Validate(IsExists, ['ListaBanco', 'id'], { message: 'Banco não encontrado' })
  bancoId?: number;

  /**
   * Nome da conta
   */
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  nome?: string;

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
  @IsOptional()
  @IsEnum(TipoConta, { message: 'Tipo deve ser BANCO ou CAIXA' })
  tipo?: TipoConta;

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
