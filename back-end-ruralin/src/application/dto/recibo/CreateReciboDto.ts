import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsNumber, Min, IsIn } from 'class-validator';

export class CreateReciboDto {
  @IsString({ message: 'Nome do emitente deve ser uma string' })
  @IsNotEmpty({ message: 'Nome do emitente e obrigatorio' })
  @MinLength(2, { message: 'Nome do emitente deve ter pelo menos 2 caracteres' })
  @MaxLength(255, { message: 'Nome do emitente deve ter no maximo 255 caracteres' })
  nomeEmitente!: string;

  @IsOptional()
  @IsString({ message: 'Documento do emitente deve ser uma string' })
  @MaxLength(18, { message: 'Documento do emitente deve ter no maximo 18 caracteres' })
  documentoEmitente?: string;

  @IsString({ message: 'Nome do beneficiario deve ser uma string' })
  @IsNotEmpty({ message: 'Nome do beneficiario e obrigatorio' })
  @MinLength(2, { message: 'Nome do beneficiario deve ter pelo menos 2 caracteres' })
  @MaxLength(255, { message: 'Nome do beneficiario deve ter no maximo 255 caracteres' })
  nomeBeneficiario!: string;

  @IsOptional()
  @IsString({ message: 'Documento do beneficiario deve ser uma string' })
  @MaxLength(18, { message: 'Documento do beneficiario deve ter no maximo 18 caracteres' })
  documentoBeneficiario?: string;

  @IsNotEmpty({ message: 'Valor e obrigatorio' })
  @IsNumber({}, { message: 'Valor deve ser um numero' })
  @Min(0.01, { message: 'Valor deve ser pelo menos 0.01' })
  valor!: number;

  @IsString({ message: 'Descricao deve ser uma string' })
  @IsNotEmpty({ message: 'Descricao e obrigatoria' })
  descricao!: string;

  @IsString({ message: 'Forma de pagamento deve ser uma string' })
  @IsNotEmpty({ message: 'Forma de pagamento e obrigatoria' })
  @IsIn(['DINHEIRO', 'PIX', 'TRANSFERENCIA', 'CHEQUE', 'BOLETO', 'CARTAO', 'OUTROS'], {
    message: 'Forma de pagamento deve ser DINHEIRO, PIX, TRANSFERENCIA, CHEQUE, BOLETO, CARTAO ou OUTROS',
  })
  formaPagamento!: string;

  @IsString({ message: 'Data de emissao deve ser uma string' })
  @IsNotEmpty({ message: 'Data de emissao e obrigatoria' })
  dataEmissao!: string;

  @IsOptional()
  @IsString({ message: 'Local deve ser uma string' })
  @MaxLength(255, { message: 'Local deve ter no maximo 255 caracteres' })
  local?: string;

  @IsOptional()
  @IsString({ message: 'Observacoes deve ser uma string' })
  observacoes?: string;

  @IsOptional()
  @IsString({ message: 'Tipo de vinculo deve ser uma string' })
  @IsIn(['AVULSO', 'TITULO_PAGAR', 'TITULO_RECEBER'], {
    message: 'Tipo de vinculo deve ser AVULSO, TITULO_PAGAR ou TITULO_RECEBER',
  })
  tipoVinculo?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Titulo a pagar deve ser um numero' })
  tituloPagarId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Titulo a receber deve ser um numero' })
  tituloReceberId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Parcela deve ser um numero' })
  parcelaId?: number;
}
