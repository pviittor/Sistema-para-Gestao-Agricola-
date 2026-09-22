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
 * UpdateApontamentoServicoDto - DTO para atualizacao de apontamento de servico
 *
 * Todos os campos sao opcionais, permitindo atualizacoes parciais.
 */
export class UpdateApontamentoServicoDto extends UpdateDto {
  /**
   * ID do apontamento relacionado
   */
  @IsOptional()
  @IsInt({ message: 'ID do apontamento deve ser um numero inteiro' })
  @Min(1, { message: 'ID do apontamento deve ser maior que zero' })
  @Validate(IsExists, ['Apontamento', 'id_apt'], { message: 'Apontamento nao encontrado' })
  idApontamento?: number;

  /**
   * ID do servico agricola
   */
  @IsOptional()
  @IsInt({ message: 'ID do servico deve ser um numero inteiro' })
  @Min(1, { message: 'ID do servico deve ser maior que zero' })
  @Validate(IsExists, ['ServicoAgricola', 'id'], { message: 'Servico agricola nao encontrado' })
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
  @Validate(IsExists, ['Moeda', 'id'], { message: 'Moeda nao encontrada' })
  idMoeda?: number;

  /**
   * ID do titulo a pagar relacionado
   */
  @IsOptional()
  @IsInt({ message: 'ID do titulo a pagar deve ser um numero inteiro' })
  @Min(1, { message: 'ID do titulo a pagar deve ser maior que zero' })
  @Validate(IsExists, ['TituloPagar', 'id'], { message: 'Titulo a pagar nao encontrado' })
  idPagar?: number;

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
   * Quantidade em toneladas
   */
  @IsOptional()
  @IsNumber({}, { message: 'Quantidade em toneladas deve ser um numero' })
  @Min(0, { message: 'Quantidade em toneladas deve ser maior ou igual a zero' })
  quantidadeTon?: number;

  /**
   * Valor unitario por tonelada
   */
  @IsOptional()
  @IsNumber({}, { message: 'Unitario por tonelada deve ser um numero' })
  @Min(0, { message: 'Unitario por tonelada deve ser maior ou igual a zero' })
  unitarioTon?: number;
}
