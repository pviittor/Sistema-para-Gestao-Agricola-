import type {
  FluxoCaixaConsolidadoDto,
  FluxoCaixaFiltros,
  FluxoCaixaPeriodoDto,
} from '@/types/FluxoCaixa'

// ── Helpers ──

function dataAtualFormatada(): string {
  return new Date().toISOString().split('T')[0] ?? ''
}

function formatarBRL(valor: number): string {
  return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarData(data: string): string {
  if (!data) return ''
  const [y, m, d] = data.split('-')
  return `${d}/${m}/${y}`
}

function labelPeriodicidade(p: string): string {
  const map: Record<string, string> = {
    diario: 'Diário',
    semanal: 'Semanal',
    mensal: 'Mensal',
    safra: 'Por Safra',
  }
  return map[p] || p
}

// ══════════════════════════════════════════════════════════════════════════════
// EXCEL
// ══════════════════════════════════════════════════════════════════════════════

export async function exportarExcel(
  consolidado: FluxoCaixaConsolidadoDto,
  filtros: FluxoCaixaFiltros,
): Promise<void> {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()

  // ── Sheet 1: Resumo ──
  const resumoData = [
    ['Relatório de Fluxo de Caixa'],
    [],
    ['Período', `${formatarData(filtros.dataInicio)} a ${formatarData(filtros.dataFim)}`],
    ['Periodicidade', labelPeriodicidade(filtros.periodicidade)],
    ['Gerado em', new Date().toLocaleString('pt-BR')],
    [],
    ['Indicador', 'Valor'],
    ['Saldo Inicial', consolidado.saldoInicial],
    ['Total Entradas', consolidado.totalEntradas],
    ['Total Saídas', consolidado.totalSaidas],
    ['Saldo Final', consolidado.saldoFinal],
    [],
    ['Total de Alertas', consolidado.alertas.length],
  ]
  const wsResumo = XLSX.utils.aoa_to_sheet(resumoData)
  wsResumo['!cols'] = [{ wch: 20 }, { wch: 25 }]
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo')

  // ── Sheet 2: Períodos ──
  const periodosData = consolidado.periodos.map((p) => ({
    'Período': p.rotulo,
    'Data Início': formatarData(p.dataInicio),
    'Data Fim': formatarData(p.dataFim),
    'Total Entradas': p.totalEntradas,
    'Total Saídas': p.totalSaidas,
    'Saldo Período': p.saldoPeriodo,
    'Saldo Acumulado': p.saldoAcumulado,
    'Qtd. Lançamentos': p.lancamentos.length,
  }))
  const wsPeriodos = XLSX.utils.json_to_sheet(periodosData)
  wsPeriodos['!cols'] = [
    { wch: 14 }, { wch: 12 }, { wch: 12 },
    { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
  ]
  XLSX.utils.book_append_sheet(wb, wsPeriodos, 'Períodos')

  // ── Sheet 3: Lançamentos Detalhados ──
  const lancamentosRows: Record<string, unknown>[] = []
  for (const p of consolidado.periodos) {
    for (const l of p.lancamentos) {
      lancamentosRows.push({
        'Período': p.rotulo,
        'Data': formatarData(l.data),
        'Tipo': l.tipoFluxo === 'entrada' ? 'Entrada' : 'Saída',
        'Descrição': l.descricao,
        'Valor': l.valor,
        'Status': l.realizado ? 'Realizado' : 'Projetado',
        'Origem': l.origem,
        'Conta Bancária': l.contaBancariaNome || 'Sem conta definida',
        'Plano de Contas': l.planoContaNome || '',
      })
    }
  }
  if (lancamentosRows.length === 0) {
    lancamentosRows.push({ 'Período': 'Nenhum lançamento encontrado' })
  }
  const wsLanc = XLSX.utils.json_to_sheet(lancamentosRows)
  wsLanc['!cols'] = [
    { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 40 },
    { wch: 16 }, { wch: 12 }, { wch: 22 }, { wch: 25 }, { wch: 20 },
  ]
  XLSX.utils.book_append_sheet(wb, wsLanc, 'Lançamentos')

  // ── Sheet 4: Saldo por Conta ──
  const contasData = consolidado.saldosPorConta.map((c) => ({
    'Conta Bancária': c.contaBancariaNome,
    'Saldo Atual': c.saldoAtual,
    'Entradas Projetadas': c.entradasProjetadas,
    'Saídas Projetadas': c.saidasProjetadas,
    'Saldo Projetado': c.saldoProjetado,
  }))
  const wsContas = XLSX.utils.json_to_sheet(contasData)
  wsContas['!cols'] = [
    { wch: 30 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 16 },
  ]
  XLSX.utils.book_append_sheet(wb, wsContas, 'Saldo por Conta')

  // ── Sheet 5: Alertas ──
  if (consolidado.alertas.length > 0) {
    const alertasData = consolidado.alertas.map((a) => ({
      'Tipo': a.tipo === 'saldo_negativo' ? 'Saldo Negativo' : a.tipo === 'saldo_critico' ? 'Saldo Crítico' : a.tipo,
      'Severidade': a.severidade,
      'Mensagem': a.mensagem,
      'Data': formatarData(a.data),
      'Valor': a.valor ?? '',
    }))
    const wsAlertas = XLSX.utils.json_to_sheet(alertasData)
    wsAlertas['!cols'] = [{ wch: 18 }, { wch: 12 }, { wch: 50 }, { wch: 12 }, { wch: 16 }]
    XLSX.utils.book_append_sheet(wb, wsAlertas, 'Alertas')
  }

  XLSX.writeFile(wb, `FluxoCaixa_${dataAtualFormatada()}.xlsx`)
}

// ══════════════════════════════════════════════════════════════════════════════
// PDF
// ══════════════════════════════════════════════════════════════════════════════

export async function exportarPDF(
  consolidado: FluxoCaixaConsolidadoDto,
  filtros: FluxoCaixaFiltros,
  chartCanvas?: HTMLCanvasElement,
): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF('p', 'mm', 'a4')
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const ml = 14 // margin left
  const mr = pw - 14 // margin right
  let y = 0
  let pageNum = 1

  // ── Cores ──
  const verde = [34, 197, 94] as const
  const vermelho = [220, 38, 38] as const
  const azul = [37, 99, 235] as const
  const cinzaClaro = [245, 245, 245] as const
  const cinzaMedio = [156, 163, 175] as const

  // ── Helpers ──
  function checkPage(needed: number) {
    if (y + needed > ph - 20) {
      addFooter()
      doc.addPage()
      pageNum++
      y = 20
    }
  }

  function addFooter() {
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(150, 150, 150)
    doc.text(`RuralIn — Fluxo de Caixa`, ml, ph - 8)
    doc.text(`Página ${pageNum}`, mr, ph - 8, { align: 'right' })
    doc.setTextColor(0, 0, 0)
  }

  function drawLine(yPos: number, color = [220, 220, 220]) {
    doc.setDrawColor(color[0]!, color[1]!, color[2]!)
    doc.setLineWidth(0.3)
    doc.line(ml, yPos, mr, yPos)
  }

  function sectionTitle(title: string) {
    checkPage(14)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 30, 30)
    doc.text(title, ml, y)
    y += 2
    drawLine(y, [100, 100, 100])
    y += 6
  }

  // ══════════════════════════════════════════════
  // CABEÇALHO
  // ══════════════════════════════════════════════

  // Faixa de cor no topo
  doc.setFillColor(101, 163, 13) // lime-600
  doc.rect(0, 0, pw, 32, 'F')

  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('Fluxo de Caixa', pw / 2, 14, { align: 'center' })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `${formatarData(filtros.dataInicio)} a ${formatarData(filtros.dataFim)}  •  ${labelPeriodicidade(filtros.periodicidade)}`,
    pw / 2, 22, { align: 'center' },
  )
  doc.text(
    `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
    pw / 2, 28, { align: 'center' },
  )

  doc.setTextColor(0, 0, 0)
  y = 42

  // ══════════════════════════════════════════════
  // RESUMO — Cards
  // ══════════════════════════════════════════════

  sectionTitle('Resumo Financeiro')

  const cards = [
    { label: 'Saldo Inicial', valor: consolidado.saldoInicial, color: azul },
    { label: 'Total Entradas', valor: consolidado.totalEntradas, color: verde },
    { label: 'Total Saídas', valor: consolidado.totalSaidas, color: vermelho },
    { label: 'Saldo Final', valor: consolidado.saldoFinal, color: consolidado.saldoFinal >= 0 ? verde : vermelho },
  ]

  const cardW = (mr - ml) / 4 - 2
  for (let i = 0; i < cards.length; i++) {
    const cx = ml + i * (cardW + 2.5)
    const card = cards[i]!

    doc.setFillColor(cinzaClaro[0], cinzaClaro[1], cinzaClaro[2])
    doc.roundedRect(cx, y, cardW, 18, 2, 2, 'F')

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(cinzaMedio[0], cinzaMedio[1], cinzaMedio[2])
    doc.text(card.label, cx + cardW / 2, y + 6, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(card.color[0], card.color[1], card.color[2])
    doc.text(formatarBRL(card.valor), cx + cardW / 2, y + 14, { align: 'center' })
  }
  doc.setTextColor(0, 0, 0)
  y += 26

  // ══════════════════════════════════════════════
  // GRÁFICO
  // ══════════════════════════════════════════════

  if (chartCanvas) {
    try {
      sectionTitle('Gráfico de Evolução')
      const imgData = chartCanvas.toDataURL('image/png')
      const imgW = mr - ml
      const imgH = (chartCanvas.height / chartCanvas.width) * imgW
      const finalH = Math.min(imgH, 80)

      checkPage(finalH + 4)
      doc.addImage(imgData, 'PNG', ml, y, imgW, finalH)
      y += finalH + 8
    } catch {
      // Canvas indisponível
    }
  }

  // ══════════════════════════════════════════════
  // TABELA DE PERÍODOS
  // ══════════════════════════════════════════════

  sectionTitle('Períodos')

  // Header
  const colP = [ml, ml + 28, ml + 63, ml + 98, ml + 133] as const
  const headersP = ['Período', 'Entradas', 'Saídas', 'Saldo Per.', 'Saldo Acum.']

  doc.setFillColor(cinzaClaro[0], cinzaClaro[1], cinzaClaro[2])
  doc.rect(ml, y - 3, mr - ml, 7, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60, 60, 60)
  headersP.forEach((h, i) => doc.text(h, colP[i]!, y + 1))
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)

  for (let idx = 0; idx < consolidado.periodos.length; idx++) {
    const p = consolidado.periodos[idx]!
    checkPage(6)

    if (idx % 2 === 1) {
      doc.setFillColor(250, 250, 250)
      doc.rect(ml, y - 3, mr - ml, 5.5, 'F')
    }

    doc.setFontSize(8)
    doc.text(p.rotulo, colP[0]!, y)
    doc.setTextColor(verde[0], verde[1], verde[2])
    doc.text(formatarBRL(p.totalEntradas), colP[1]!, y)
    doc.setTextColor(vermelho[0], vermelho[1], vermelho[2])
    doc.text(formatarBRL(p.totalSaidas), colP[2]!, y)
    const corSaldo = p.saldoPeriodo >= 0 ? verde : vermelho
    doc.setTextColor(corSaldo[0], corSaldo[1], corSaldo[2])
    doc.text(formatarBRL(p.saldoPeriodo), colP[3]!, y)
    const corAcum = p.saldoAcumulado >= 0 ? verde : vermelho
    doc.setTextColor(corAcum[0], corAcum[1], corAcum[2])
    doc.text(formatarBRL(p.saldoAcumulado), colP[4]!, y)
    doc.setTextColor(0, 0, 0)
    y += 5.5
  }
  y += 4

  // ══════════════════════════════════════════════
  // MOVIMENTOS DETALHADOS POR PERÍODO
  // ══════════════════════════════════════════════

  sectionTitle('Movimentos Detalhados')

  for (const periodo of consolidado.periodos) {
    if (periodo.lancamentos.length === 0) continue

    checkPage(16)

    // Sub-header do período
    doc.setFillColor(235, 235, 235)
    doc.rect(ml, y - 3, mr - ml, 7, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(40, 40, 40)
    doc.text(
      `${periodo.rotulo}  —  Entradas: ${formatarBRL(periodo.totalEntradas)}  |  Saídas: ${formatarBRL(periodo.totalSaidas)}  |  Saldo: ${formatarBRL(periodo.saldoPeriodo)}`,
      ml + 2, y + 1,
    )
    y += 8

    // Header de lançamentos
    const colL = [ml + 2, ml + 16, ml + 58, ml + 118, ml + 148] as const
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 100, 100)
    doc.text('Data', colL[0]!, y)
    doc.text('Descrição', colL[1]!, y)
    doc.text('Valor', colL[2]!, y)
    doc.text('Status', colL[3]!, y)
    doc.text('Tipo', colL[4]!, y)
    y += 1
    drawLine(y)
    y += 3

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)

    // Ordenar: entradas primeiro, depois saídas
    const sorted = [...periodo.lancamentos].sort((a, b) => {
      if (a.data !== b.data) return a.data.localeCompare(b.data)
      if (a.tipoFluxo !== b.tipoFluxo) return a.tipoFluxo === 'entrada' ? -1 : 1
      return 0
    })

    for (const l of sorted) {
      checkPage(5)

      doc.setFontSize(7)
      doc.text(formatarData(l.data), colL[0]!, y)

      // Truncar descrição se muito longa
      const descMax = 55
      const desc = l.descricao.length > descMax ? l.descricao.substring(0, descMax) + '...' : l.descricao
      doc.text(desc, colL[1]!, y)

      const isEntrada = l.tipoFluxo === 'entrada'
      doc.setTextColor(isEntrada ? verde[0] : vermelho[0], isEntrada ? verde[1] : vermelho[1], isEntrada ? verde[2] : vermelho[2])
      doc.text((isEntrada ? '+' : '-') + ' ' + formatarBRL(l.valor), colL[2]!, y)
      doc.setTextColor(0, 0, 0)

      doc.text(l.realizado ? 'Realizado' : 'Projetado', colL[3]!, y)
      doc.text(isEntrada ? 'Entrada' : 'Saída', colL[4]!, y)
      y += 4.5
    }
    y += 3
  }

  // ══════════════════════════════════════════════
  // SALDO POR CONTA
  // ══════════════════════════════════════════════

  if (consolidado.saldosPorConta.length > 0) {
    sectionTitle('Saldo por Conta Bancária')

    const colC = [ml, ml + 55, ml + 85, ml + 115, ml + 145] as const
    const headersC = ['Conta', 'Saldo Atual', 'Entr. Projetadas', 'Saíd. Projetadas', 'Saldo Projetado']

    doc.setFillColor(cinzaClaro[0], cinzaClaro[1], cinzaClaro[2])
    doc.rect(ml, y - 3, mr - ml, 7, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(60, 60, 60)
    headersC.forEach((h, i) => doc.text(h, colC[i]!, y + 1))
    y += 7

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)

    for (const c of consolidado.saldosPorConta) {
      checkPage(6)
      doc.setFontSize(8)
      doc.text(c.contaBancariaNome, colC[0]!, y)
      doc.text(formatarBRL(c.saldoAtual), colC[1]!, y)
      doc.setTextColor(verde[0], verde[1], verde[2])
      doc.text(formatarBRL(c.entradasProjetadas), colC[2]!, y)
      doc.setTextColor(vermelho[0], vermelho[1], vermelho[2])
      doc.text(formatarBRL(c.saidasProjetadas), colC[3]!, y)
      const corProj = c.saldoProjetado >= 0 ? verde : vermelho
      doc.setTextColor(corProj[0], corProj[1], corProj[2])
      doc.text(formatarBRL(c.saldoProjetado), colC[4]!, y)
      doc.setTextColor(0, 0, 0)
      y += 5.5
    }
    y += 4
  }

  // ══════════════════════════════════════════════
  // ALERTAS
  // ══════════════════════════════════════════════

  if (consolidado.alertas.length > 0) {
    sectionTitle('Alertas')

    for (const a of consolidado.alertas) {
      checkPage(12)

      const isDanger = a.severidade === 'danger'
      const bgColor = isDanger ? [254, 226, 226] : [254, 243, 199]
      const txtColor = isDanger ? vermelho : [180, 83, 9]

      doc.setFillColor(bgColor[0]!, bgColor[1]!, bgColor[2]!)
      doc.roundedRect(ml, y - 3, mr - ml, 10, 1.5, 1.5, 'F')

      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(txtColor[0]!, txtColor[1]!, txtColor[2]!)
      doc.text(`${isDanger ? '⚠' : '!'} ${a.mensagem}`, ml + 3, y + 2)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.text(`Data: ${formatarData(a.data)}${a.valor != null ? '  •  Valor: ' + formatarBRL(a.valor) : ''}`, ml + 3, y + 6)

      doc.setTextColor(0, 0, 0)
      y += 13
    }
  }

  // Footer na última página
  addFooter()

  doc.save(`FluxoCaixa_${dataAtualFormatada()}.pdf`)
}
