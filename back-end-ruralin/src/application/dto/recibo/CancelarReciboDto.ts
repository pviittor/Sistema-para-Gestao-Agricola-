import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CancelarReciboDto {
  @IsString({ message: 'Motivo do cancelamento deve ser uma string' })
  @IsNotEmpty({ message: 'Motivo do cancelamento e obrigatorio' })
  @MinLength(10, { message: 'Motivo deve ter pelo menos 10 caracteres' })
  motivoCancelamento!: string;
}
