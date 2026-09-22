/**
 * MoedaConversionService - Serviço de Conversão de Moeda
 * 
 * Serviço responsável por realizar conversões de valores entre moedas,
 * especialmente para conversão automática para moeda padrão (BRL).
 * 
 * Implementa a regra de negócio RN-009: Conversão Automática para Moeda Padrão.
 */

import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IMoedaConversionService } from './IMoedaConversionService';
import { IMoedaRepository } from '../../../infrastructure/repository/IMoedaRepository';
import { IMoedaCotacaoRepository } from '../../../infrastructure/repository/IMoedaCotacaoRepository';
import { NotFoundException, BusinessException } from '../../../core/exceptions';

@Injectable()
export class MoedaConversionService implements IMoedaConversionService {
  constructor(
    @Inject(TYPES.IMoedaRepository)
    private moedaRepository: IMoedaRepository,
    @Inject(TYPES.IMoedaCotacaoRepository)
    private moedaCotacaoRepository: IMoedaCotacaoRepository
  ) {}

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
  async converterParaMoedaPadrao(
    idMoeda: number,
    valor: number,
    dataReferencia: string | Date,
    tenantId: number
  ): Promise<{ valorMoedaOriginal: number; valorMoedaPadrao: number }> {
    // Validar entrada
    if (!idMoeda || !valor || valor <= 0) {
      throw new BusinessException(
        'Parâmetros inválidos para conversão de moeda.',
        'CONVERSAO_MOEDA_INVALIDA'
      );
    }

    // Verificar se é moeda padrão (BRL)
    const isPadrao = await this.isMoedaPadrao(idMoeda, tenantId);
    if (isPadrao) {
      return {
        valorMoedaOriginal: valor,
        valorMoedaPadrao: valor,
      };
    }

    // Buscar cotação mais próxima da data de referência
    const cotacao = await this.buscarCotacaoPorData(idMoeda, dataReferencia, tenantId);

    if (cotacao === null) {
      // Se não houver cotação, assumir 1:1 (moeda sem cotação ou BRL)
      return {
        valorMoedaOriginal: valor,
        valorMoedaPadrao: valor,
      };
    }

    // Calcular valor convertido: valorMoedaPadrao = valorMoedaOriginal * cotacao
    const valorMoedaPadrao = Number(valor) * Number(cotacao);

    return {
      valorMoedaOriginal: valor,
      valorMoedaPadrao: Number(valorMoedaPadrao.toFixed(2)), // Arredondar para 2 casas decimais
    };
  }

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
  async buscarCotacaoPorData(
    idMoeda: number,
    dataReferencia: string | Date,
    tenantId: number
  ): Promise<number | null> {
    // Converter data para Date se necessário
    const dataRef = dataReferencia instanceof Date 
      ? dataReferencia 
      : new Date(dataReferencia);

    // Buscar todas as cotações da moeda (já filtradas por tenant no repository)
    const cotacoes = await this.moedaCotacaoRepository.findByMoeda(idMoeda);

    if (cotacoes.length === 0) {
      return null;
    }

    // Filtrar cotações do tenant
    const cotacoesTenant = cotacoes.filter(c => c.tenantId === tenantId);

    if (cotacoesTenant.length === 0) {
      return null;
    }

    // Ordenar por data (mais recente primeiro)
    cotacoesTenant.sort((a, b) => {
      const dataA = a.data_cotacao instanceof Date 
        ? a.data_cotacao 
        : new Date(a.data_cotacao);
      const dataB = b.data_cotacao instanceof Date 
        ? b.data_cotacao 
        : new Date(b.data_cotacao);
      return dataB.getTime() - dataA.getTime();
    });

    // Buscar cotação mais próxima (anterior ou igual à data de referência)
    const cotacaoProxima = cotacoesTenant.find(c => {
      const dataCotacao = c.data_cotacao instanceof Date 
        ? c.data_cotacao 
        : new Date(c.data_cotacao);
      return dataCotacao <= dataRef;
    });

    // Se encontrou cotação anterior ou igual, usar ela
    if (cotacaoProxima) {
      return Number(cotacaoProxima.valor_cotacao);
    }

    // Se não encontrou, usar a mais recente disponível
    const ultimaCotacao = cotacoesTenant[0];
    return Number(ultimaCotacao.valor_cotacao);
  }

  /**
   * Verifica se uma moeda é BRL (moeda padrão)
   * 
   * @param idMoeda - ID da moeda
   * @param tenantId - ID do tenant
   * @returns true se for BRL, false caso contrário
   */
  async isMoedaPadrao(idMoeda: number, tenantId: number): Promise<boolean> {
    // Buscar moeda
    const moeda = await this.moedaRepository.findById(idMoeda);
    
    if (!moeda) {
      throw new NotFoundException('Moeda', idMoeda);
    }

    // Verificar se é BRL pela sigla ou código
    // Assumindo que BRL tem siglabc_moeda = 'BRL' ou descricao contém 'Real'
    const sigla = moeda.siglabc_moeda?.toUpperCase() || '';
    const descricao = moeda.descricao_moeda?.toUpperCase() || '';
    
    return sigla === 'BRL' || descricao.includes('REAL') || descricao.includes('BRL');
  }
}
