/**
 * AgingReportService — Relatório de aging por faixas de vencimento
 *
 * RN-22: Considera apenas parcelas ABERTA ou PARCIAL
 * RN-23: Usa valor_saldo (não valor_total) para representar o que está em aberto
 * RN-24: Suporta filtros cumulativos (fazenda, safra, fornecedor, plano de conta)
 * RN-25: "a vencer" começa em D+1, "vence hoje" é faixa própria, "vencido" é D-1+
 */

import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { RequirePermission } from '../../../core/authorization';
import { Cacheable } from '../../../core/cache';
import {
  IAgingReportService,
  AgingFiltrosDto,
  AgingReportResponseDto,
  AgingFaixa,
  ParcelaAgingDto,
} from './IAgingReportService';
import ParcelaTituloPagar from '../../../models/ParcelaTituloPagar';
import ParcelaTituloReceber from '../../../models/ParcelaTituloReceber';
import TituloPagar from '../../../models/TituloPagar';
import TituloReceber from '../../../models/TituloReceber';
import Pessoa from '../../../models/Pessoa';
import Fazenda from '../../../models/Fazenda';
import { Op } from 'sequelize';

const FAIXAS_CONFIG = [
  { label: 'Vencido > 90 dias', diasMin: 91, diasMax: null },
  { label: 'Vencido 61-90 dias', diasMin: 61, diasMax: 90 },
  { label: 'Vencido 31-60 dias', diasMin: 31, diasMax: 60 },
  { label: 'Vencido 16-30 dias', diasMin: 16, diasMax: 30 },
  { label: 'Vencido 8-15 dias', diasMin: 8, diasMax: 15 },
  { label: 'Vencido 1-7 dias', diasMin: 1, diasMax: 7 },
  { label: 'Vence hoje', diasMin: 0, diasMax: 0 },
  { label: 'A vencer 1-7 dias', diasMin: -7, diasMax: -1 },
  { label: 'A vencer 8-15 dias', diasMin: -15, diasMax: -8 },
  { label: 'A vencer 16-30 dias', diasMin: -30, diasMax: -16 },
  { label: 'A vencer 31-60 dias', diasMin: -60, diasMax: -31 },
  { label: 'A vencer 61-90 dias', diasMin: -90, diasMax: -61 },
  { label: 'A vencer > 90 dias', diasMin: null, diasMax: -91 },
];

@Injectable()
export class AgingReportService implements IAgingReportService {
  constructor() {}

  @RequirePermission('tituloPagar.read')
  async gerarAging(tenantId: number, filtros: AgingFiltrosDto): Promise<AgingReportResponseDto> {
    const dataBase = filtros.dataBase ? new Date(filtros.dataBase) : new Date();
    const dataBaseStr = dataBase.toISOString().split('T')[0];
    const parcelas: ParcelaAgingDto[] = [];

    // Buscar parcelas a pagar
    if (filtros.tipo === 'PAGAR' || filtros.tipo === 'AMBOS') {
      const parcelasPagar = await this.buscarParcelasPagar(tenantId, filtros);
      for (const p of parcelasPagar) {
        const diasAtraso = this.calcularDiasAtraso(p.dataVencimento, dataBase);
        parcelas.push({
          idParcela: p.id,
          idTitulo: p.idTituloPagar,
          tipo: 'PAGAR',
          numeroParcela: p.numeroParcela,
          numeroTotalParcelas: (p as any).numeroTotalParcelas || 1,
          dataVencimento: String(p.dataVencimento),
          valorTotal: Number((p as any).valorTotal) || Number(p.valorParcela),
          valorSaldo: Number((p as any).valorSaldo) || Number(p.valorParcela),
          diasAtraso,
          fornecedorCliente: (p as any).tituloPagar?.fornecedor?.nomerazao_pessoa,
          numeroTitulo: (p as any).tituloPagar?.numeroTitulo,
          fazenda: (p as any).tituloPagar?.fazenda?.descricao,
        });
      }
    }

    // Buscar parcelas a receber
    if (filtros.tipo === 'RECEBER' || filtros.tipo === 'AMBOS') {
      const parcelasReceber = await this.buscarParcelasReceber(tenantId, filtros);
      for (const p of parcelasReceber) {
        const diasAtraso = this.calcularDiasAtraso(p.dataVencimento, dataBase);
        parcelas.push({
          idParcela: p.id,
          idTitulo: (p as any).idTituloReceber,
          tipo: 'RECEBER',
          numeroParcela: p.numeroParcela,
          numeroTotalParcelas: (p as any).numeroTotalParcelas || 1,
          dataVencimento: String(p.dataVencimento),
          valorTotal: Number((p as any).valorTotal) || Number(p.valorParcela),
          valorSaldo: Number((p as any).valorSaldo) || Number(p.valorParcela),
          diasAtraso,
          fornecedorCliente: (p as any).tituloReceber?.cliente?.nomerazao_pessoa,
          numeroTitulo: (p as any).tituloReceber?.numeroTitulo,
          fazenda: (p as any).tituloReceber?.fazenda?.descricao,
        });
      }
    }

    // Classificar em faixas
    const faixas: AgingFaixa[] = FAIXAS_CONFIG.map(config => ({
      label: config.label,
      diasMin: config.diasMin,
      diasMax: config.diasMax,
      count: 0,
      valorTotal: 0,
      valorSaldo: 0,
      parcelas: [],
    }));

    for (const parcela of parcelas) {
      const faixa = this.classificarFaixa(parcela.diasAtraso, faixas);
      if (faixa) {
        faixa.count++;
        faixa.valorTotal += parcela.valorTotal;
        faixa.valorSaldo += parcela.valorSaldo;
        faixa.parcelas.push(parcela);
      }
    }

    // Arredondar valores
    for (const f of faixas) {
      f.valorTotal = Math.round(f.valorTotal * 100) / 100;
      f.valorSaldo = Math.round(f.valorSaldo * 100) / 100;
    }

    const totalGeral = {
      count: parcelas.length,
      valorTotal: Math.round(parcelas.reduce((s, p) => s + p.valorTotal, 0) * 100) / 100,
      valorSaldo: Math.round(parcelas.reduce((s, p) => s + p.valorSaldo, 0) * 100) / 100,
    };

    return {
      tipo: filtros.tipo,
      dataReferencia: dataBaseStr,
      faixas,
      totalGeral,
    };
  }

  private async buscarParcelasPagar(tenantId: number, filtros: AgingFiltrosDto): Promise<ParcelaTituloPagar[]> {
    const where: any = {
      tenantId,
      status: { [Op.in]: ['ABERTA', 'PARCIAL'] },
    };

    const tituloWhere: any = { tenantId };
    if (filtros.idFazenda) tituloWhere.idFazenda = filtros.idFazenda;
    if (filtros.idSafra) tituloWhere.idSafra = filtros.idSafra;
    if (filtros.idFornecedorCliente) tituloWhere.idFornecedor = filtros.idFornecedorCliente;

    return ParcelaTituloPagar.findAll({
      where,
      include: [
        {
          model: TituloPagar,
          as: 'tituloPagar',
          where: tituloWhere,
          include: [
            { model: Pessoa, as: 'fornecedor', attributes: ['nomerazao_pessoa'] },
            { model: Fazenda, as: 'fazenda', attributes: ['descricao'] },
          ],
        },
      ],
      order: [['dataVencimento', 'ASC']],
    });
  }

  private async buscarParcelasReceber(tenantId: number, filtros: AgingFiltrosDto): Promise<any[]> {
    const where: any = {
      tenantId,
      status: { [Op.in]: ['ABERTA', 'PARCIAL'] },
    };

    const tituloWhere: any = { tenantId };
    if (filtros.idFazenda) tituloWhere.idFazenda = filtros.idFazenda;
    if (filtros.idSafra) tituloWhere.idSafra = filtros.idSafra;
    if (filtros.idFornecedorCliente) tituloWhere.idCliente = filtros.idFornecedorCliente;

    return ParcelaTituloReceber.findAll({
      where,
      include: [
        {
          model: TituloReceber,
          as: 'tituloReceber',
          where: tituloWhere,
          include: [
            { model: Pessoa, as: 'cliente', attributes: ['nomerazao_pessoa'] },
            { model: Fazenda, as: 'fazenda', attributes: ['descricao'] },
          ],
        },
      ],
      order: [['dataVencimento', 'ASC']],
    });
  }

  /**
   * Calcula dias de atraso (positivo = vencido, 0 = hoje, negativo = a vencer)
   */
  private calcularDiasAtraso(dataVencimento: Date | string, dataBase: Date): number {
    const venc = new Date(String(dataVencimento));
    const diff = dataBase.getTime() - venc.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Classifica parcela na faixa correta
   */
  private classificarFaixa(diasAtraso: number, faixas: AgingFaixa[]): AgingFaixa | null {
    for (const faixa of faixas) {
      const min = faixa.diasMin;
      const max = faixa.diasMax;

      // Vencido > 90 (min=91, max=null)
      if (min !== null && max === null && diasAtraso >= min) return faixa;
      // A vencer > 90 (min=null, max=-91)
      if (min === null && max !== null && diasAtraso <= max) return faixa;
      // Faixa com ambos os limites
      if (min !== null && max !== null && diasAtraso >= min && diasAtraso <= max) return faixa;
    }
    return null;
  }
}
