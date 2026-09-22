/**
 * Interface para item de NF-e parseada
 */
export interface ParsedNfeItem {
  numero: number
  descricao: string
  ncm: string
  cfop: string
  unidade: string
  quantidade: number
  vlUnitario: number
  vlTotal: number
  vlIcms: number
  vlIpi: number
  vlPis: number
  vlCofins: number
  codigoProduto?: string
  ean?: string
}

/**
 * Interface para duplicata de NF-e parseada
 */
export interface ParsedNfeDuplicata {
  numero: string
  dataVencimento: string
  valor: number
}

/**
 * Interface para NF-e parseada (retorno do parser XML / consulta SEFAZ)
 */
export interface ParsedNfe {
  chaveAcesso: string
  numero: string
  serie: string
  modelo: string
  dataEmissao: string
  dataEntradaSaida?: string
  naturezaOperacao: string
  cfop: string
  finalidade?: string
  emitente: {
    cnpj: string
    razaoSocial: string
    inscricaoEstadual?: string
    uf: string
    municipio?: string
    endereco?: string
  }
  destinatario: {
    cnpj: string
    razaoSocial: string
    inscricaoEstadual?: string
    uf: string
  }
  vlProdutos: number
  vlFrete: number
  vlSeguro: number
  vlDesconto: number
  vlOutros: number
  vlIpi: number
  vlIcms: number
  vlPis: number
  vlCofins: number
  vlTotal: number
  itens: ParsedNfeItem[]
  duplicatas: ParsedNfeDuplicata[]
  informacoesAdicionais?: string
}

/**
 * Interface para status do serviço SEFAZ
 */
export interface StatusServico {
  disponivel: boolean
  motivo: string
  tempoMedioResposta?: number
  dataConsulta: string
  uf: string
  ambiente: string
}
