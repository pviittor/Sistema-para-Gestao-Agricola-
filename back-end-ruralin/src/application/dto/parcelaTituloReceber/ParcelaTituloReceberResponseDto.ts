import { StatusParcela } from '../../../models/ParcelaTituloReceber';

/**
 * ParcelaTituloReceberResponseDto - DTO para resposta de parcela de título a receber
 * 
 * DTO usado nas respostas da API para parcela de título a receber.
 */
export class ParcelaTituloReceberResponseDto {
  id!: number;
  tenantId!: number;
  idTituloReceber!: number;
  numeroParcela!: number;
  dataVencimento!: string;
  valorParcela!: number;
  valorParcelaMoedaOriginal?: number | null;
  valorParcelaMoedaPadrao?: number | null;
  dataBaixa?: string | null;
  valorBaixa?: number | null;
  status!: StatusParcela;
  observacao?: string | null;
  usercreation!: number;
  datecreation!: Date;

  /**
   * Relacionamentos opcionais (quando incluídos na query)
   */
  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;

  tituloReceber?: {
    id: number;
    numeroTitulo: string;
    valorTitulo: number;
    dataLancamento: string;
    status: string;
  } | null;
}
