/**
 * ParcelamentoService — Geração automática de parcelas
 *
 * Implementa dois modelos de juros:
 * - SIMPLES: Juros simples sobre o saldo devedor
 * - PRICE: Tabela Price (parcelas fixas, juros compostos)
 *
 * RN-01: Gera automaticamente N parcelas dentro da mesma transação
 * RN-02: Soma dos valorParcela == valorTitulo (ajuste de centavos na última parcela)
 * RN-03: Juros simples e Tabela Price configuráveis pelo usuário
 * RN-04: dataVencimento[i] = dataPrimeiraParcela + (i-1) * intervaloParcelasDias
 */

import { Injectable } from '../../../core/di';
import {
  IParcelamentoService,
  ParcelamentoConfigDto,
  ParcelaGerada,
} from './IParcelamentoService';
import { BusinessException } from '../../../core/exceptions';

@Injectable()
export class ParcelamentoService implements IParcelamentoService {
  /**
   * Gera parcelas para um título com base na configuração.
   */
  gerarParcelas(valorTitulo: number, config: ParcelamentoConfigDto): ParcelaGerada[] {
    const { quantidadeParcelas, taxaJurosAm, modeloJuros, intervaloParcelasDias, dataPrimeiraParcela } = config;

    if (quantidadeParcelas < 1 || quantidadeParcelas > 360) {
      throw new BusinessException(
        'Quantidade de parcelas deve estar entre 1 e 360.',
        'QUANTIDADE_PARCELAS_INVALIDA'
      );
    }

    if (valorTitulo <= 0) {
      throw new BusinessException(
        'Valor do título deve ser maior que zero.',
        'VALOR_TITULO_INVALIDO'
      );
    }

    const taxa = taxaJurosAm || 0;

    if (modeloJuros === 'PRICE' && taxa > 0) {
      return this.gerarParcelasPrice(valorTitulo, quantidadeParcelas, taxa, intervaloParcelasDias, dataPrimeiraParcela);
    }

    return this.gerarParcelasJurosSimples(valorTitulo, quantidadeParcelas, taxa, intervaloParcelasDias, dataPrimeiraParcela);
  }

  /**
   * Juros simples: cada parcela tem juros proporcional ao período
   * valorParcela[i] = valorTitulo / n
   * valorJuros[i] = valorTitulo * taxaJurosAm * i
   * valorTotal[i] = valorParcela[i] + valorJuros[i]
   */
  private gerarParcelasJurosSimples(
    valorTitulo: number,
    n: number,
    taxa: number,
    intervaloDias: number,
    dataPrimeira: string
  ): ParcelaGerada[] {
    const parcelas: ParcelaGerada[] = [];
    const valorParcelaBase = Math.floor((valorTitulo / n) * 100) / 100;

    // Calcular total de juros
    let somaValoresParcela = 0;

    for (let i = 1; i <= n; i++) {
      const dataVencimento = this.calcularDataVencimento(dataPrimeira, i - 1, intervaloDias);
      const valorJuros = this.arredondar(valorTitulo * taxa * i);

      let valorParcela: number;
      if (i === n) {
        // Última parcela ajusta centavos (RN-02)
        valorParcela = this.arredondar(valorTitulo - somaValoresParcela);
      } else {
        valorParcela = valorParcelaBase;
        somaValoresParcela += valorParcela;
      }

      const valorTotal = this.arredondar(valorParcela + valorJuros);

      parcelas.push({
        numeroParcela: i,
        dataVencimento,
        valorParcela,
        valorJuros,
        valorCorrecao: 0,
        valorTotal,
        valorSaldo: valorTotal,
        taxaJuros: taxa,
        numeroTotalParcelas: n,
      });
    }

    return parcelas;
  }

  /**
   * Tabela Price: PMT fixo = P * [r / (1 - (1+r)^(-n))]
   * Onde P = valor presente, r = taxa ao mês, n = número de parcelas
   *
   * Cada parcela: juros = saldo * taxa, amortização = PMT - juros
   */
  private gerarParcelasPrice(
    valorTitulo: number,
    n: number,
    taxa: number,
    intervaloDias: number,
    dataPrimeira: string
  ): ParcelaGerada[] {
    const parcelas: ParcelaGerada[] = [];

    // Cálculo do PMT (prestação fixa)
    const pmt = this.arredondar(
      valorTitulo * (taxa / (1 - Math.pow(1 + taxa, -n)))
    );

    let saldoDevedor = valorTitulo;
    let somaAmortizacao = 0;

    for (let i = 1; i <= n; i++) {
      const dataVencimento = this.calcularDataVencimento(dataPrimeira, i - 1, intervaloDias);
      const valorJuros = this.arredondar(saldoDevedor * taxa);

      let amortizacao: number;
      let valorParcelaEfetivo: number;

      if (i === n) {
        // Última parcela: ajustar para zerar saldo (RN-02)
        amortizacao = this.arredondar(valorTitulo - somaAmortizacao);
        valorParcelaEfetivo = this.arredondar(amortizacao + valorJuros);
      } else {
        amortizacao = this.arredondar(pmt - valorJuros);
        valorParcelaEfetivo = pmt;
        somaAmortizacao += amortizacao;
      }

      saldoDevedor = this.arredondar(saldoDevedor - amortizacao);

      parcelas.push({
        numeroParcela: i,
        dataVencimento,
        valorParcela: amortizacao,
        valorJuros,
        valorCorrecao: 0,
        valorTotal: valorParcelaEfetivo,
        valorSaldo: valorParcelaEfetivo,
        taxaJuros: taxa,
        numeroTotalParcelas: n,
      });
    }

    return parcelas;
  }

  /**
   * Calcula data de vencimento: dataPrimeira + offset * intervaloDias
   */
  private calcularDataVencimento(dataPrimeira: string, offset: number, intervaloDias: number): string {
    const data = new Date(dataPrimeira);
    data.setDate(data.getDate() + offset * intervaloDias);
    return data.toISOString().split('T')[0];
  }

  /**
   * Arredonda para 2 casas decimais
   */
  private arredondar(valor: number): number {
    return Math.round(valor * 100) / 100;
  }
}
