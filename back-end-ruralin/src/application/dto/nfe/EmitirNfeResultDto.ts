import { NotaFiscalResponseDto } from '../notaFiscal/NotaFiscalResponseDto';
import { RetornoSefazDto } from './RetornoSefazDto';

/**
 * DTO com resultado completo de emissão de NF-e
 */
export class EmitirNfeResultDto {
  /** Se a emissão foi bem-sucedida */
  sucesso!: boolean;
  /** NF atualizada com dados da autorização */
  notaFiscal!: NotaFiscalResponseDto;
  /** Retorno detalhado da SEFAZ */
  retornoSefaz!: RetornoSefazDto;
  /** XML autorizado completo (NF + protocolo) */
  xmlAutorizado?: string | null;
}
