import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { RequirePermission } from '../../../core/authorization/RequirePermission';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BusinessException } from '../../../core/exceptions/BusinessException';
import { IReciboRepository } from '../../../infrastructure/repository/IReciboRepository';
import { IConfiguracaoReciboRepository } from '../../../infrastructure/repository/IConfiguracaoReciboRepository';
import { IReciboPdfService } from './IReciboPdfService';
import { getRequestContext } from '../../../core/authorization/helpers';
import Recibo from '../../../models/Recibo';
import PDFDocument from 'pdfkit';
import archiver from 'archiver';

@Injectable()
export class ReciboPdfService implements IReciboPdfService {
  constructor(
    @Inject(TYPES.IReciboRepository) private readonly reciboRepository: IReciboRepository,
    @Inject(TYPES.IConfiguracaoReciboRepository) private readonly configuracaoRepository: IConfiguracaoReciboRepository
  ) {}

  @RequirePermission('recibo.print')
  async gerarPdf(id: number): Promise<Buffer> {
    const recibo = await this.reciboRepository.findById(id);
    if (!recibo) throw new NotFoundException('Recibo não encontrado');

    // Incrementar contador de impressões
    await this.reciboRepository.update(id, {
      quantidadeImpressoes: (recibo.quantidadeImpressoes || 0) + 1,
    } as any);

    // Buscar configuração do tenant
    const config = await this.configuracaoRepository.findByTenant();

    return this.gerarPdfBuffer(recibo, config);
  }

  @RequirePermission('recibo.exportBatch')
  async exportarLote(ids: number[]): Promise<Buffer> {
    if (!ids || ids.length === 0) throw new BusinessException('Informe pelo menos um ID');
    if (ids.length > 50) throw new BusinessException('Máximo de 50 recibos por lote');

    const config = await this.configuracaoRepository.findByTenant();

    return new Promise(async (resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const chunks: Buffer[] = [];

      archive.on('data', (chunk: Buffer) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', (err: Error) => reject(err));

      for (const id of ids) {
        const recibo = await this.reciboRepository.findById(id);
        if (recibo) {
          const pdfBuffer = await this.gerarPdfBuffer(recibo, config);
          archive.append(pdfBuffer, { name: `recibo-${recibo.numeroFormatado}.pdf` });
        }
      }

      await archive.finalize();
    });
  }

  private async gerarPdfBuffer(recibo: Recibo, config: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 30, bottom: 30, left: 40, right: 40 },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: Error) => reject(err));

      const pageWidth = 595.28;
      const contentWidth = pageWidth - 80; // margins
      const halfHeight = 421; // A4 height / 2

      // Via 1 - Emitente
      this.renderVia(doc, recibo, config, 30, '1ª VIA - EMITENTE', contentWidth);

      // Linha de corte pontilhada
      const cutY = halfHeight - 10;
      doc.save();
      doc.dash(5, { space: 3 });
      doc.moveTo(20, cutY).lineTo(pageWidth - 20, cutY).stroke('#999999');
      doc.restore();

      // Texto de corte
      doc.fontSize(7).fillColor('#999999');
      doc.text('✂ Corte aqui', pageWidth / 2 - 25, cutY - 10);
      doc.fillColor('#000000');

      // Via 2 - Beneficiário
      this.renderVia(doc, recibo, config, halfHeight, '2ª VIA - BENEFICIÁRIO', contentWidth);

      doc.end();
    });
  }

  private renderVia(
    doc: any,
    recibo: Recibo,
    config: any,
    startY: number,
    viaLabel: string,
    contentWidth: number
  ): void {
    const leftMargin = 40;
    let y = startY;

    // --- Cabeçalho com logo e dados da fazenda ---
    if (config) {
      // Logo
      if (config.logoBase64) {
        try {
          const logoBuffer = Buffer.from(config.logoBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
          doc.image(logoBuffer, leftMargin, y, { width: 60, height: 60 });
        } catch (e) {
          // Logo inválido, ignorar
        }
      }

      const headerX = config.logoBase64 ? leftMargin + 70 : leftMargin;
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(config.nomePropriedade || '', headerX, y, { width: contentWidth - 70 });
      y += 16;

      doc.fontSize(8).font('Helvetica');
      if (config.cnpjCpf) {
        doc.text(`CNPJ/CPF: ${config.cnpjCpf}`, headerX, y);
        y += 11;
      }
      if (config.inscricaoEstadual) {
        doc.text(`IE: ${config.inscricaoEstadual}`, headerX, y);
        y += 11;
      }
      if (config.endereco) {
        doc.text(config.endereco, headerX, y, { width: contentWidth - 70 });
        y += 11;
      }
      if (config.telefone) {
        doc.text(`Tel: ${config.telefone}`, headerX, y);
        y += 11;
      }
    }

    y = Math.max(y, startY + 65);

    // --- Título do recibo ---
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('RECIBO', leftMargin, y, { width: contentWidth, align: 'center' });
    y += 20;

    // Via label e número
    doc.fontSize(8).font('Helvetica').fillColor('#666666');
    doc.text(viaLabel, leftMargin, y);
    doc.text(`Nº ${recibo.numeroFormatado}`, leftMargin, y, { width: contentWidth, align: 'right' });
    doc.fillColor('#000000');
    y += 16;

    // Linha separadora
    doc.moveTo(leftMargin, y).lineTo(leftMargin + contentWidth, y).stroke();
    y += 10;

    // --- Valor em destaque ---
    doc.fontSize(16).font('Helvetica-Bold');
    const valorFormatado = `R$ ${Number(recibo.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    doc.text(valorFormatado, leftMargin, y, { width: contentWidth, align: 'right' });
    y += 22;

    // --- Dados do recibo ---
    doc.fontSize(9).font('Helvetica');
    const lineHeight = 14;

    doc.font('Helvetica-Bold').text('Emitente: ', leftMargin, y, { continued: true });
    doc.font('Helvetica').text(recibo.nomeEmitente || '');
    y += lineHeight;

    if (recibo.documentoEmitente) {
      doc.text(`CPF/CNPJ Emitente: ${recibo.documentoEmitente}`, leftMargin, y);
      y += lineHeight;
    }

    doc.font('Helvetica-Bold').text('Beneficiário: ', leftMargin, y, { continued: true });
    doc.font('Helvetica').text(recibo.nomeBeneficiario || '');
    y += lineHeight;

    if (recibo.documentoBeneficiario) {
      doc.text(`CPF/CNPJ Beneficiário: ${recibo.documentoBeneficiario}`, leftMargin, y);
      y += lineHeight;
    }

    // Valor por extenso
    doc.font('Helvetica-Bold').text('Valor por extenso: ', leftMargin, y, { continued: true });
    doc.font('Helvetica').text(recibo.valorExtenso || '', { width: contentWidth - 90 });
    y += lineHeight + 4;

    // Descrição
    doc.font('Helvetica-Bold').text('Referente a: ', leftMargin, y, { continued: true });
    doc.font('Helvetica').text(recibo.descricao || '', { width: contentWidth - 70 });
    y += lineHeight + 4;

    // Forma de pagamento e data
    doc.text(`Forma de Pagamento: ${recibo.formaPagamento}`, leftMargin, y);
    const dataFormatada = recibo.dataEmissao ? new Date(recibo.dataEmissao + 'T00:00:00').toLocaleDateString('pt-BR') : '';
    doc.text(`Data: ${dataFormatada}`, leftMargin + contentWidth / 2, y);
    y += lineHeight;

    // Local
    if (recibo.local) {
      doc.text(`Local: ${recibo.local}`, leftMargin, y);
      y += lineHeight;
    }

    // Observações
    if (recibo.observacoes) {
      doc.text(`Obs: ${recibo.observacoes}`, leftMargin, y, { width: contentWidth });
      y += lineHeight;
    }

    // Observação padrão do config
    if (config?.observacaoPadrao) {
      doc.fontSize(7).fillColor('#666666');
      doc.text(config.observacaoPadrao, leftMargin, y, { width: contentWidth });
      doc.fillColor('#000000');
      y += lineHeight;
    }

    // Status cancelado
    if (recibo.status === 'CANCELADO') {
      doc.save();
      doc.fontSize(30).fillColor('#FF0000').opacity(0.3);
      doc.text('CANCELADO', leftMargin, startY + 150, { width: contentWidth, align: 'center' });
      doc.restore();
      doc.fillColor('#000000').opacity(1);
    }

    // --- Linha de assinatura ---
    y = startY + 310;
    doc.moveTo(leftMargin + 50, y).lineTo(leftMargin + contentWidth / 2 - 20, y).stroke();
    doc.moveTo(leftMargin + contentWidth / 2 + 20, y).lineTo(leftMargin + contentWidth - 50, y).stroke();
    y += 5;
    doc.fontSize(8).font('Helvetica');
    doc.text('Emitente', leftMargin + 50, y, { width: contentWidth / 2 - 70, align: 'center' });
    doc.text('Beneficiário', leftMargin + contentWidth / 2 + 20, y, { width: contentWidth / 2 - 70, align: 'center' });
  }
}
