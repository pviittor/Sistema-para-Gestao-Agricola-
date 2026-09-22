import { StatusParcela } from '../../../models/ParcelaTituloPagar';

/**
 * ParcelaTituloPagarResponseDto - DTO para resposta de parcela de título a pagar
 * 
 * DTO usado nas respostas da API para parcela de título a pagar.
 */
export class ParcelaTituloPagarResponseDto {
  id!: number;
  tenantId!: number;
  idTituloPagar!: number;
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

  tituloPagar?: {
    id: number;
    numeroTitulo: string;
    valorTitulo: number;
    dataLancamento: string;
    status: string;
  } | null;
}
