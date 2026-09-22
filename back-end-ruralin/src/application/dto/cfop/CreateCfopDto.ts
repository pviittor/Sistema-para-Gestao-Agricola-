import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
  IsIn,
} from 'class-validator';
import { CreateDto } from '../CreateDto';

export class CreateCfopDto extends CreateDto {
  @IsString({ message: 'Código deve ser uma string' })
  @IsNotEmpty({ message: 'Código é obrigatório' })
  @MinLength(4, { message: 'Código deve ter 4 caracteres' })
  @MaxLength(4, { message: 'Código deve ter 4 caracteres' })
  @Matches(/^[1-7]\d{3}$/, { message: 'Código CFOP deve iniciar com 1-7 seguido de 3 dígitos' })
  codigo!: string;

  @IsString({ message: 'Descrição deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MaxLength(500, { message: 'Descrição deve ter no máximo 500 caracteres' })
  descricao!: string;

  @IsString({ message: 'Natureza deve ser uma string' })
  @IsNotEmpty({ message: 'Natureza é obrigatória' })
  @IsIn(['entrada', 'saida'], { message: 'Natureza deve ser entrada ou saida' })
  natureza!: string;

  @IsString({ message: 'Tipo de operação deve ser uma string' })
  @IsNotEmpty({ message: 'Tipo de operação é obrigatório' })
  @IsIn(['venda', 'compra', 'transferencia', 'remessa', 'retorno', 'devolucao', 'bonificacao', 'consignacao', 'outras'], { message: 'Tipo de operação inválido' })
  tipo_operacao!: string;

  @IsOptional()
  @IsBoolean({ message: 'gera_financeiro deve ser um booleano' })
  gera_financeiro?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'movimenta_estoque deve ser um booleano' })
  movimenta_estoque?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'aplicacao_ipi deve ser um booleano' })
  aplicacao_ipi?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'aplicacao_icms deve ser um booleano' })
  aplicacao_icms?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'aplicacao_pis_cofins deve ser um booleano' })
  aplicacao_pis_cofins?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'ativo deve ser um booleano' })
  ativo?: boolean;
}
