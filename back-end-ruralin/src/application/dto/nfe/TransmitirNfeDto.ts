import { IsString, IsNotEmpty, IsIn } from 'class-validator';

/**
 * DTO para transmissão de NF-e à SEFAZ
 */
export class TransmitirNfeDto {
  @IsString()
  @IsNotEmpty({ message: 'XML é obrigatório' })
  xml!: string;

  @IsString()
  @IsNotEmpty({ message: 'UF é obrigatória' })
  uf!: string;

  @IsString()
  @IsIn(['homologacao', 'producao'], { message: 'Ambiente deve ser homologacao ou producao' })
  ambiente!: string;
}
