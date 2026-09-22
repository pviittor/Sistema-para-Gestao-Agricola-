import { StatusLancamentoRecorrente } from '../../../models/LancamentoRecorrente';

/**
 * LancamentoRecorrenteResponseDto - DTO para resposta de lancamento recorrente
 *
 * DTO usado nas respostas da API para lancamento recorrente.
 */
export class LancamentoRecorrenteResponseDto {
  id!: number;
  tenantId!: number;
  recorrenciaFinanceiraId!: number;
  tituloPagarId?: number | null;
  tituloReceberId?: number | null;
  dataReferencia!: string;
  dataVencimentoGerado!: string;
  valorGerado!: number;
  status!: StatusLancamentoRecorrente;
  observacao?: string | null;
  usercreation!: number;
  datecreation!: Date;

  /**
   * Relacionamentos opcionais (quando incluidos na query)
   */
  recorrencia?: {
    id: number;
    descricao: string;
    tipo: string;
    periodicidade: string;
    valor: number;
    ativa: boolean;
  } | null;

  tituloPagar?: {
    id: number;
    numeroTitulo: string;
    valorTitulo: number;
    dataLancamento: string;
    status: string;
  } | null;

  tituloReceber?: {
    id: number;
    numeroTitulo: string;
    valorTitulo: number;
    dataLancamento: string;
    status: string;
  } | null;

  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;
}
