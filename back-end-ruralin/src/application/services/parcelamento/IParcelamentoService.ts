/**
 * Interface para o serviço de parcelamento
 *
 * Responsável pela geração automática de N parcelas ao criar um título
 * com tipo_geracao = 'PARCELADO', suportando juros simples e Tabela Price.
 */
export interface ParcelamentoConfigDto {
  quantidadeParcelas: number;
  taxaJurosAm: number;
  modeloJuros: 'SIMPLES' | 'PRICE';
  indiceCorrecao: 'NENHUM' | 'IPCA' | 'IGPM' | 'FIXO';
  taxaCorrecaoFixaAm?: number;
  taxaMulta?: number;
  intervaloParcelasDias: number;
  dataPrimeiraParcela: string;
}

export interface ParcelaGerada {
  numeroParcela: number;
  dataVencimento: string;
  valorParcela: number;
  valorJuros: number;
  valorCorrecao: number;
  valorTotal: number;
  valorSaldo: number;
  taxaJuros: number;
  numeroTotalParcelas: number;
}

export interface IParcelamentoService {
  /**
   * Gera parcelas para um título com base na configuração de parcelamento.
   *
   * @param valorTitulo - Valor total do título
   * @param config - Configuração de parcelamento
   * @returns Array de parcelas geradas
   */
  gerarParcelas(valorTitulo: number, config: ParcelamentoConfigDto): ParcelaGerada[];
}
