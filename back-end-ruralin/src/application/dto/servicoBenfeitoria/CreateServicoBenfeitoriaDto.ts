import {
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
  IsString,
  Min,
  Validate,
  IsNotEmpty,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * CreateServicoBenfeitoriaDto - DTO para criacao de servico de benfeitoria
 */
export class CreateServicoBenfeitoriaDto extends CreateDto {
  /**
   * ID da benfeitoria relacionada
   */
  @IsInt({ message: 'ID da benfeitoria deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID da benfeitoria e obrigatorio' })
  @Min(1, { message: 'ID da benfeitoria deve ser maior que zero' })
  @Validate(IsExists, ['Benfeitoria', 'id_benf'], { message: 'Benfeitoria nao encontrada' })
  idBenfeitoria!: number;

  /**
   * ID do servico agricola
   */
  @IsInt({ message: 'ID do servico deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID do servico e obrigatorio' })
  @Min(1, { message: 'ID do servico deve ser maior que zero' })
  @Validate(IsExists, ['ServicoAgricola', 'id_srv'], { message: 'Servico agricola nao encontrado' })
  idServico!: number;

  /**
   * ID do responsavel pelo servico (pessoa)
   */
  @IsInt({ message: 'ID do responsavel deve ser um numero inteiro' })
  @IsNotEmpty({ message: 'ID do responsavel e obrigatorio' })
  @Min(1, { message: 'ID do responsavel deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Responsavel nao encontrado' })
  idResponsavel!: number;

  /**
   * ID da moeda utilizada
   */
  @IsOptional()
  @IsInt({ message: 'ID da moeda deve ser um numero inteiro' })
  @Min(1, { message: 'ID da moeda deve ser maior que zero' })
  @Validate(IsExists, ['Moeda', 'id_moeda'], { message: 'Moeda nao encontrada' })
  idMoeda?: number;

  /**
   * Data do servico
   */
  @IsDateString({}, { message: 'Data deve ser uma data valida no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data e obrigatoria' })
  data!: string;

  /**
   * Valor do servico
   */
  @IsNumber({}, { message: 'Valor deve ser um numero' })
  @IsNotEmpty({ message: 'Valor e obrigatorio' })
  @Min(0, { message: 'Valor deve ser maior ou igual a zero' })
  valor!: number;

  /**
   * Tempo gasto no servico
   */
  @IsNumber({}, { message: 'Tempo deve ser um numero' })
  @IsNotEmpty({ message: 'Tempo e obrigatorio' })
  @Min(0, { message: 'Tempo deve ser maior ou igual a zero' })
  tempo!: number;

  /**
   * Observacoes adicionais
   */
  @IsOptional()
  @IsString({ message: 'Observacao deve ser uma string' })
  observacao?: string;

  /**
   * ID da safra
   */
  @IsOptional()
  @IsInt({ message: 'ID da safra deve ser um numero inteiro' })
  @Min(1, { message: 'ID da safra deve ser maior que zero' })
  @Validate(IsExists, ['Safra', 'id'], { message: 'Safra nao encontrada' })
  idSafra?: number;
}
