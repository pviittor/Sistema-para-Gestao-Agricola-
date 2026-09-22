import {
  IsOptional,
  IsInt,
  IsDateString,
  IsNumber,
  IsString,
  Min,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';

/**
 * UpdateServicoBenfeitoriaDto - DTO para atualizacao de servico de benfeitoria
 *
 * Todos os campos sao opcionais, permitindo atualizacoes parciais.
 */
export class UpdateServicoBenfeitoriaDto extends UpdateDto {
  /**
   * ID da benfeitoria relacionada
   */
  @IsOptional()
  @IsInt({ message: 'ID da benfeitoria deve ser um numero inteiro' })
  @Min(1, { message: 'ID da benfeitoria deve ser maior que zero' })
  @Validate(IsExists, ['Benfeitoria', 'id_benf'], { message: 'Benfeitoria nao encontrada' })
  idBenfeitoria?: number;

  /**
   * ID do servico agricola
   */
  @IsOptional()
  @IsInt({ message: 'ID do servico deve ser um numero inteiro' })
  @Min(1, { message: 'ID do servico deve ser maior que zero' })
  @Validate(IsExists, ['ServicoAgricola', 'id_srv'], { message: 'Servico agricola nao encontrado' })
  idServico?: number;

  /**
   * ID do responsavel pelo servico (pessoa)
   */
  @IsOptional()
  @IsInt({ message: 'ID do responsavel deve ser um numero inteiro' })
  @Min(1, { message: 'ID do responsavel deve ser maior que zero' })
  @Validate(IsExists, ['Pessoa', 'id_pessoa'], { message: 'Responsavel nao encontrado' })
  idResponsavel?: number;

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
  @IsOptional()
  @IsDateString({}, { message: 'Data deve ser uma data valida no formato YYYY-MM-DD' })
  data?: string;

  /**
   * Valor do servico
   */
  @IsOptional()
  @IsNumber({}, { message: 'Valor deve ser um numero' })
  @Min(0, { message: 'Valor deve ser maior ou igual a zero' })
  valor?: number;

  /**
   * Tempo gasto no servico
   */
  @IsOptional()
  @IsNumber({}, { message: 'Tempo deve ser um numero' })
  @Min(0, { message: 'Tempo deve ser maior ou igual a zero' })
  tempo?: number;

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
