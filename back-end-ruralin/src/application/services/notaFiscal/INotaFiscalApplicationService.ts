import { IApplicationService } from '../IApplicationService';
import { CreateNotaFiscalDto } from '../../dto/notaFiscal/CreateNotaFiscalDto';
import { UpdateNotaFiscalDto } from '../../dto/notaFiscal/UpdateNotaFiscalDto';
import { NotaFiscalResponseDto } from '../../dto/notaFiscal/NotaFiscalResponseDto';
import { CreateNotaFiscalCompletoDto } from '../../dto/notaFiscal/CreateNotaFiscalCompletoDto';
import { UpdateNotaFiscalCompletoDto } from '../../dto/notaFiscal/UpdateNotaFiscalCompletoDto';
import { EmitirNfeResultDto } from '../../dto/nfe/EmitirNfeResultDto';

/**
 * Interface para Application Service de NotaFiscal
 */
export interface INotaFiscalApplicationService extends IApplicationService<NotaFiscalResponseDto, CreateNotaFiscalDto, UpdateNotaFiscalDto> {
  /**
   * Cancela uma nota fiscal
   */
  cancelar(id: number, motivo: string): Promise<NotaFiscalResponseDto>;

  /**
   * Autoriza uma nota fiscal
   */
  autorizar(id: number, chaveAcesso?: string, protocoloAutorizacao?: string): Promise<NotaFiscalResponseDto>;

  /**
   * Inutiliza uma nota fiscal
   */
  inutilizar(id: number, motivo: string): Promise<NotaFiscalResponseDto>;

  /**
   * Movimenta estoque a partir de uma nota fiscal autorizada
   */
  movimentarEstoque(id: number): Promise<NotaFiscalResponseDto>;

  /**
   * Gera lancamentos financeiros a partir de uma nota fiscal autorizada
   */
  gerarFinanceiro(id: number): Promise<NotaFiscalResponseDto>;

  /**
   * Busca nota fiscal pela chave de acesso NF-e
   */
  findByChaveAcesso(chaveAcesso: string): Promise<NotaFiscalResponseDto | null>;

  /**
   * Lista notas fiscais por periodo de emissao
   */
  findByPeriodo(dataInicio: string, dataFim: string, tipo?: string, status?: string): Promise<NotaFiscalResponseDto[]>;

  /**
   * Lista notas fiscais por emitente
   */
  findByEmitente(emitenteId: number, tipo?: string): Promise<NotaFiscalResponseDto[]>;

  /**
   * Lista notas fiscais por destinatario
   */
  findByDestinatario(destinatarioId: number): Promise<NotaFiscalResponseDto[]>;

  /**
   * Busca notas autorizadas que ainda nao movimentaram estoque
   */
  findPendentesMovimentacao(tipo?: string): Promise<NotaFiscalResponseDto[]>;

  /**
   * Busca notas autorizadas sem financeiro gerado
   */
  findPendentesFinanceiro(tipo?: string): Promise<NotaFiscalResponseDto[]>;

  /**
   * Soma de totais agrupados por tipo/periodo
   */
  totalPorPeriodo(dataInicio: string, dataFim: string): Promise<any>;

  /**
   * Cria uma nota fiscal completa com itens em uma unica operacao atomica
   */
  createCompleto(dto: CreateNotaFiscalCompletoDto): Promise<NotaFiscalResponseDto>;

  /**
   * Atualiza uma nota fiscal completa com itens (delete-and-recreate) em operacao atomica
   */
  updateCompleto(id: number, dto: UpdateNotaFiscalCompletoDto): Promise<NotaFiscalResponseDto>;

  /**
   * Busca uma nota fiscal por ID com todos os detalhes (itens + associacoes)
   */
  getByIdDetalhado(id: number): Promise<NotaFiscalResponseDto | null>;

  /**
   * Emite NF-e/NFC-e: gera XML → assina → transmite para SEFAZ → autoriza
   */
  emitir(id: number, certificadoId?: number): Promise<EmitirNfeResultDto>;

  /**
   * Inutiliza uma faixa de numeração na SEFAZ
   */
  inutilizarFaixa(
    cnpj: string,
    serie: string,
    numInicial: number,
    numFinal: number,
    justificativa: string,
    certificadoId: number,
    uf: string,
    ambiente: string
  ): Promise<any>;
}
