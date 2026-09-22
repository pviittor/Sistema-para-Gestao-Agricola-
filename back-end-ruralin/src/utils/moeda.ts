/**
 * Utilitários para formatação de valores monetários.
 *
 * - `toMoeda(val)` — converte para number com 2 casas decimais.
 * - `formatarMoeda(val)` — retorna string no formato "R$ 1.234,56".
 * - `adicionarCamposFormatados(dto, campos)` — adiciona campos `*Formatado`
 *   ao DTO, com o valor formatado em BRL.
 */

/**
 * Converte um valor para número com 2 casas decimais.
 * Retorna 0 se o valor for null/undefined/NaN.
 */
export function toMoeda(val: any): number {
  if (val == null) return 0;
  const num = Number(val);
  if (isNaN(num)) return 0;
  return parseFloat(num.toFixed(2));
}

/**
 * Formata um valor numérico como moeda brasileira (BRL).
 * Exemplo: 1234.5 → "R$ 1.234,50"
 */
export function formatarMoeda(val: number | null | undefined, moeda: string = 'BRL'): string {
  if (val == null) return 'R$ 0,00';
  const num = Number(val);
  if (isNaN(num)) return 'R$ 0,00';

  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: moeda,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Adiciona campos formatados (`*Formatado`) ao DTO para cada campo monetário listado.
 *
 * @param dto - O DTO de resposta (será mutado)
 * @param camposMoeda - Lista de nomes dos campos monetários
 * @param moeda - Código da moeda (padrão: 'BRL')
 * @returns O próprio DTO, com os campos formatados adicionados
 */
export function adicionarCamposFormatados<T extends Record<string, any>>(
  dto: T,
  camposMoeda: string[],
  moeda: string = 'BRL',
): T {
  for (const campo of camposMoeda) {
    if (campo in dto && dto[campo] != null) {
      (dto as any)[`${campo}Formatado`] = formatarMoeda(dto[campo], moeda);
    }
  }
  return dto;
}
