import { Injectable } from '../../../core/di'
import { INfeXmlParserService } from './INfeXmlParserService'
import { ParsedNfeDto } from '../../dto/nfe/ParsedNfeDto'
import { ParsedNfeItemDto } from '../../dto/nfe/ParsedNfeItemDto'
import { ParsedNfeDuplicataDto } from '../../dto/nfe/ParsedNfeDuplicataDto'
import { BusinessException } from '../../../core/exceptions/BusinessException'
import { parseStringPromise } from 'xml2js'

/**
 * Serviço de parsing de XML NF-e 4.0
 *
 * Extrai dados estruturados de um XML NF-e usando xml2js.
 * Stateless — não depende de tenant ou contexto de request.
 */
@Injectable()
export class NfeXmlParserService implements INfeXmlParserService {

  /**
   * Faz parsing de um XML NF-e 4.0 e retorna dados estruturados
   */
  async parseXml(xmlContent: string): Promise<ParsedNfeDto> {
    if (!xmlContent || xmlContent.trim().length === 0) {
      throw new BusinessException('Conteúdo XML vazio ou inválido', 'XML_VAZIO')
    }

    let parsed: any
    try {
      parsed = await parseStringPromise(xmlContent, {
        explicitArray: false,
        ignoreAttrs: false,
        tagNameProcessors: [],
      })
    } catch (error: any) {
      throw new BusinessException(
        `Erro ao fazer parsing do XML: ${error.message}`,
        'XML_PARSE_ERROR'
      )
    }

    // Localizar o nó da NF-e (pode ser nfeProc > NFe > infNFe ou NFe > infNFe)
    const infNFe = this.extrairInfNFe(parsed)
    if (!infNFe) {
      throw new BusinessException(
        'XML não contém nó infNFe válido. Verifique se é um XML de NF-e 4.0',
        'XML_SEM_INFNFE'
      )
    }

    const ide = infNFe.ide || {}
    const emit = infNFe.emit || {}
    const dest = infNFe.dest || {}
    const total = infNFe.total?.ICMSTot || {}
    const cobr = infNFe.cobr || {}
    const infAdic = infNFe.infAdic || {}

    // Extrair chave de acesso do atributo Id do infNFe
    const chaveAcesso = this.extrairChaveAcesso(infNFe, parsed)

    const dto = new ParsedNfeDto()
    dto.chaveAcesso = chaveAcesso
    dto.numero = this.texto(ide.nNF)
    dto.serie = this.texto(ide.serie)
    dto.modelo = this.texto(ide.mod)
    dto.dataEmissao = this.texto(ide.dhEmi)
    dto.dataEntradaSaida = this.texto(ide.dhSaiEnt) || undefined
    dto.naturezaOperacao = this.texto(ide.natOp)
    dto.finalidade = this.texto(ide.finNFe) || undefined

    // CFOP do primeiro item (referência principal)
    const itens = this.extrairItens(infNFe)
    dto.cfop = itens.length > 0 ? itens[0].cfop : ''

    // Emitente
    const emitEnder = emit.enderEmit || {}
    dto.emitente = {
      cnpj: this.texto(emit.CNPJ || emit.CPF),
      razaoSocial: this.texto(emit.xNome),
      inscricaoEstadual: this.texto(emit.IE) || undefined,
      uf: this.texto(emitEnder.UF),
      municipio: this.texto(emitEnder.xMun) || undefined,
      endereco: this.montarEndereco(emitEnder),
    }

    // Destinatário
    dto.destinatario = {
      cnpj: this.texto(dest.CNPJ || dest.CPF),
      razaoSocial: this.texto(dest.xNome),
      inscricaoEstadual: this.texto(dest.IE) || undefined,
      uf: this.texto(dest.enderDest?.UF),
    }

    // Totais
    dto.vlProdutos = this.numero(total.vProd)
    dto.vlFrete = this.numero(total.vFrete)
    dto.vlSeguro = this.numero(total.vSeg)
    dto.vlDesconto = this.numero(total.vDesc)
    dto.vlOutros = this.numero(total.vOutro)
    dto.vlIpi = this.numero(total.vIPI)
    dto.vlIcms = this.numero(total.vICMS)
    dto.vlPis = this.numero(total.vPIS)
    dto.vlCofins = this.numero(total.vCOFINS)
    dto.vlTotal = this.numero(total.vNF)

    // Itens
    dto.itens = itens

    // Duplicatas
    dto.duplicatas = this.extrairDuplicatas(cobr)

    // Informações adicionais
    dto.informacoesAdicionais = this.texto(infAdic.infCpl) || undefined

    return dto
  }

  /**
   * Localiza o nó infNFe no XML parseado
   */
  private extrairInfNFe(parsed: any): any {
    // nfeProc > NFe > infNFe (NF-e com protocolo)
    if (parsed.nfeProc?.NFe?.infNFe) {
      return parsed.nfeProc.NFe.infNFe
    }
    // NFe > infNFe (NF-e sem protocolo)
    if (parsed.NFe?.infNFe) {
      return parsed.NFe.infNFe
    }
    // infNFe direto (raro)
    if (parsed.infNFe) {
      return parsed.infNFe
    }
    return null
  }

  /**
   * Extrai chave de acesso do atributo Id do infNFe ou do protNFe
   */
  private extrairChaveAcesso(infNFe: any, parsed: any): string {
    // Atributo Id do infNFe: "NFe35..." → remover prefixo "NFe"
    const id = infNFe.$?.Id || ''
    if (id.startsWith('NFe')) {
      return id.substring(3)
    }
    if (id.length === 44) {
      return id
    }

    // Tentar do protNFe
    const protNFe = parsed.nfeProc?.protNFe?.infProt
    if (protNFe?.chNFe) {
      return this.texto(protNFe.chNFe)
    }

    return id || ''
  }

  /**
   * Extrai itens do nó det (pode ser array ou objeto único)
   */
  private extrairItens(infNFe: any): ParsedNfeItemDto[] {
    const det = infNFe.det
    if (!det) return []

    const detArray = Array.isArray(det) ? det : [det]

    return detArray.map((item: any, index: number) => {
      const prod = item.prod || {}
      const imposto = item.imposto || {}
      const icms = this.extrairValorImposto(imposto.ICMS)
      const ipi = this.extrairValorImposto(imposto.IPI)
      const pis = this.extrairValorImposto(imposto.PIS)
      const cofins = this.extrairValorImposto(imposto.COFINS)

      const dto = new ParsedNfeItemDto()
      dto.numero = Number(item.$?.nItem) || (index + 1)
      dto.descricao = this.texto(prod.xProd)
      dto.ncm = this.texto(prod.NCM)
      dto.cfop = this.texto(prod.CFOP)
      dto.unidade = this.texto(prod.uCom)
      dto.quantidade = this.numero(prod.qCom)
      dto.vlUnitario = this.numero(prod.vUnCom)
      dto.vlTotal = this.numero(prod.vProd)
      dto.vlIcms = icms
      dto.vlIpi = ipi
      dto.vlPis = pis
      dto.vlCofins = cofins
      dto.codigoProduto = this.texto(prod.cProd) || undefined
      dto.ean = this.texto(prod.cEAN) || undefined

      return dto
    })
  }

  /**
   * Extrai valor de imposto de um nó genérico (ICMS, IPI, PIS, COFINS)
   * Cada nó de imposto tem sub-nós variáveis (ICMS00, ICMS10, etc.)
   */
  private extrairValorImposto(node: any): number {
    if (!node) return 0

    // Percorrer sub-nós para encontrar vICMS, vIPI, vPIS, vCOFINS
    const subNodes = Object.values(node)
    for (const subNode of subNodes) {
      if (subNode && typeof subNode === 'object') {
        const sub = subNode as any
        if (sub.vICMS !== undefined) return this.numero(sub.vICMS)
        if (sub.vIPI !== undefined) return this.numero(sub.vIPI)
        if (sub.vPIS !== undefined) return this.numero(sub.vPIS)
        if (sub.vCOFINS !== undefined) return this.numero(sub.vCOFINS)
      }
    }
    return 0
  }

  /**
   * Extrai duplicatas do nó cobr
   */
  private extrairDuplicatas(cobr: any): ParsedNfeDuplicataDto[] {
    if (!cobr || !cobr.dup) return []

    const dupArray = Array.isArray(cobr.dup) ? cobr.dup : [cobr.dup]

    return dupArray.map((dup: any) => {
      const dto = new ParsedNfeDuplicataDto()
      dto.numero = this.texto(dup.nDup)
      dto.dataVencimento = this.texto(dup.dVenc)
      dto.valor = this.numero(dup.vDup)
      return dto
    })
  }

  /**
   * Monta endereço completo a partir do nó de endereço
   */
  private montarEndereco(ender: any): string {
    const partes = [
      this.texto(ender.xLgr),
      this.texto(ender.nro),
      this.texto(ender.xCpl),
      this.texto(ender.xBairro),
    ].filter(Boolean)
    return partes.join(', ')
  }

  /**
   * Extrai texto de um valor (pode ser string, número ou objeto)
   */
  private texto(value: any): string {
    if (value === null || value === undefined) return ''
    if (typeof value === 'string') return value.trim()
    if (typeof value === 'number') return String(value)
    if (typeof value === 'object' && value._) return String(value._).trim()
    return String(value)
  }

  /**
   * Converte valor para número
   */
  private numero(value: any): number {
    if (value === null || value === undefined) return 0
    const num = Number(value)
    return isNaN(num) ? 0 : Number(num.toFixed(2))
  }
}
