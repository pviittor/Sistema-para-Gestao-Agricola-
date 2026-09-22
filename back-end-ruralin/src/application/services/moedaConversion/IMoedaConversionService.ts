/**
 * Interface para Serviço de Conversão de Moeda
 * 
 * Define os métodos disponíveis para conversão de valores entre moedas,
 * especialmente para conversão automática para moeda padrão (BRL).
 */

export interface IMoedaConversionService {
  /**
   * Converte valor de moeda para moeda padrão (BRL) - RN-009
   * 
   * Busca a cotação mais próxima da data especificada e calcula o valor convertido.
   * Se a moeda for BRL ou não houver cotação, retorna o mesmo valor.
   * 
   * @param idMoeda - ID da moeda
   * @param valor - Valor a ser convertido
   * @param dataReferencia - Data de referência para buscar cotação (data de lançamento ou baixa)
   * @param tenantId - ID do tenant
   * @returns Objeto com valorMoedaOriginal e valorMoedaPadrao
   */
  converterParaMoedaPadrao(
    idMoeda: number,
    valor: number,
    dataReferencia: string | Date,
    tenantId: number
  ): Promise<{ valorMoedaOriginal: number; valorMoedaPadrao: number }>;

  /**
   * Busca cotação mais próxima de uma data específica
   * 
   * Busca a cotação mais próxima (anterior ou igual) à data de referência.
   * Se não encontrar, busca a cotação mais recente disponível.
   * 
   * @param idMoeda - ID da moeda
   * @param dataReferencia - Data de referência
   * @param tenantId - ID do tenant
   * @returns Valor da cotação ou null se não encontrada
   */
  buscarCotacaoPorData(
    idMoeda: number,
    dataReferencia: string | Date,
    tenantId: number
  ): Promise<number | null>;

  /**
   * Verifica se uma moeda é BRL (moeda padrão)
   * 
   * @param idMoeda - ID da moeda
   * @param tenantId - ID do tenant
   * @returns true se for BRL, false caso contrário
   */
  isMoedaPadrao(idMoeda: number, tenantId: number): Promise<boolean>;
}
