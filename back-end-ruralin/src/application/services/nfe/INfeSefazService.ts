import { ParsedNfeDto } from '../../dto/nfe/ParsedNfeDto'
import { StatusServicoDto } from '../../dto/nfe/StatusServicoDto'
import { RetornoSefazDto } from '../../dto/nfe/RetornoSefazDto'

/**
 * Interface para serviço de comunicação com a SEFAZ
 *
 * Inclui consulta, transmissão, cancelamento, inutilização e contingência.
 */
export interface INfeSefazService {
  /**
   * Consulta NF-e na SEFAZ pela chave de acesso
   */
  consultarPorChave(chaveAcesso: string, certificadoId: number): Promise<ParsedNfeDto>

  /**
   * Consulta status do serviço SEFAZ para uma UF
   */
  consultarStatusServico(uf: string, ambiente: string): Promise<StatusServicoDto>

  /**
   * Transmite XML NF-e assinado para SEFAZ
   */
  transmitir(xmlAssinado: string, uf: string, ambiente: string): Promise<RetornoSefazDto>

  /**
   * Consulta processamento de lote por recibo
   */
  consultarProcessamento(recibo: string, uf: string, ambiente: string): Promise<RetornoSefazDto>

  /**
   * Cancela NF-e autorizada na SEFAZ
   */
  cancelar(chaveAcesso: string, protocolo: string, justificativa: string, certificadoId: number): Promise<RetornoSefazDto>

  /**
   * Inutiliza faixa de numeração na SEFAZ
   */
  inutilizar(cnpj: string, serie: string, numInicial: number, numFinal: number, justificativa: string, certificadoId: number, uf: string, ambiente: string): Promise<RetornoSefazDto>

  /**
   * Ativa modo de contingência para o tenant
   */
  ativarContingencia(tipo: string, justificativa: string, tenantId: number): Promise<void>

  /**
   * Desativa modo de contingência
   */
  desativarContingencia(tenantId: number): Promise<void>

  /**
   * Verifica se contingência está ativa para o tenant
   */
  isContingenciaAtiva(tenantId: number): Promise<boolean>
}
