import {
  IsDateString,
  IsOptional,
  IsInt,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

/**
 * Enum para tipo de título no relatório
 */
export enum TipoTituloRelatorio {
  PAGAR = 'PAGAR',
  RECEBER = 'RECEBER',
  TODOS = 'TODOS',
}

/**
 * FiltroPlanejadoRealizadoDto - DTO para filtros do relatório de planejado vs realizado
 * 
 * DTO usado no endpoint de consulta de relatório de planejado vs realizado.
 * Permite filtrar por período, safra, fazenda, plano de contas, centro de custo e tipo de título.
 */
export class FiltroPlanejadoRealizadoDto {
  /**
   * Data inicial do período (obrigatório)
   */
  @IsDateString({}, { message: 'Data inicial deve ser uma data válida no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data inicial é obrigatória' })
  dataInicio!: string;

  /**
   * Data final do período (obrigatório)
   */
  @IsDateString({}, { message: 'Data final deve ser uma data válida no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data final é obrigatória' })
  dataFim!: string;

  /**
   * ID da safra (opcional)
   */
  @IsOptional()
  @IsInt({ message: 'ID da safra deve ser um número inteiro' })
  idSafra?: number;

  /**
   * ID da fazenda (opcional)
   */
  @IsOptional()
  @IsInt({ message: 'ID da fazenda deve ser um número inteiro' })
  idFazenda?: number;

  /**
   * ID do plano de contas gerencial (opcional)
   */
  @IsOptional()
  @IsInt({ message: 'ID do plano de contas gerencial deve ser um número inteiro' })
  idPlanoContaGerencial?: number;

  /**
   * ID do centro de custo (opcional)
   */
  @IsOptional()
  @IsInt({ message: 'ID do centro de custo deve ser um número inteiro' })
  idCentroCusto?: number;

  /**
   * Tipo de título (PAGAR, RECEBER ou TODOS)
   */
  @IsOptional()
  @IsEnum(TipoTituloRelatorio, { message: 'Tipo de título deve ser PAGAR, RECEBER ou TODOS' })
  tipo?: TipoTituloRelatorio;
}
