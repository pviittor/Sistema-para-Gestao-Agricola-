import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { BusinessException } from '../../../core/exceptions/BusinessException';
import { INfeXmlGeneratorService } from './INfeXmlGeneratorService';
import { INotaFiscalRepository } from '../../../infrastructure/repository/INotaFiscalRepository';
import { INumeracaoNfeRepository } from '../../../infrastructure/repository/INumeracaoNfeRepository';
import NotaFiscal from '../../../models/NotaFiscal';
import ItemNotaFiscal from '../../../models/ItemNotaFiscal';
import Pessoa from '../../../models/Pessoa';
import Produto from '../../../models/Produto';
import Cfop from '../../../models/Cfop';

/**
 * Serviço de geração de XML NF-e 4.0
 * Monta XML completo a partir dos dados de NotaFiscal + ItemNotaFiscal
 */
@Injectable()
export class NfeXmlGeneratorService implements INfeXmlGeneratorService {
  constructor(
    @Inject(TYPES.INotaFiscalRepository) private readonly notaFiscalRepository: INotaFiscalRepository,
    @Inject(TYPES.INumeracaoNfeRepository) private readonly numeracaoRepository: INumeracaoNfeRepository
  ) {}

  async gerarXml(notaFiscalId: number, tenantId: number): Promise<string> {
    // Buscar NF completa com includes
    const nf = await NotaFiscal.findOne({
      where: { id_nf: notaFiscalId, tenantId },
      include: [
        { model: ItemNotaFiscal, as: 'itens', include: [{ model: Produto, as: 'produto' }] },
        { model: Pessoa, as: 'emitente' },
        { model: Pessoa, as: 'destinatario' },
        { model: Cfop, as: 'cfop' },
      ],
    });

    if (!nf) throw new BusinessException('Nota fiscal não encontrada');
    if (!nf.emitente) throw new BusinessException('Emitente não encontrado na nota fiscal');

    // Validar campos obrigatórios
    this.validarCamposObrigatorios(nf);

    // Obter próximo número sequencial
    const numero = await this.numeracaoRepository.proximoNumero(
      nf.serie || '1',
      nf.modelo || '55',
      tenantId
    );

    // Gerar código numérico aleatório (8 dígitos)
    const cNF = String(Math.floor(Math.random() * 99999999)).padStart(8, '0');

    // Montar dados para chave de acesso
    const cnpjEmitente = (nf.emitente.cpfcnpj_pessoa || '').replace(/\D/g, '');
    const uf = this.getCodigoUF(nf);
    const dataEmissao = new Date(nf.data_emissao);
    const AAMM = String(dataEmissao.getFullYear()).slice(2) + String(dataEmissao.getMonth() + 1).padStart(2, '0');
    const mod = (nf.modelo || '55').padStart(2, '0');
    const serie = (nf.serie || '1').padStart(3, '0');
    const nNF = String(numero).padStart(9, '0');
    const tpEmis = nf.contingencia_tipo ? '6' : '1'; // 1=Normal, 6=SVC-AN

    // Montar chave de acesso (43 dígitos + dígito verificador)
    const chaveSemDV = `${uf}${AAMM}${cnpjEmitente.padStart(14, '0')}${mod}${serie}${nNF}${tpEmis}${cNF}`;
    const cDV = this.calcularDigitoVerificador(chaveSemDV);
    const chaveAcesso = `${chaveSemDV}${cDV}`;

    // Montar XML
    const xml = this.montarXml(nf, numero, chaveAcesso, cNF, tpEmis);

    // Atualizar NF com número sequencial e chave
    await NotaFiscal.update(
      { numero_sequencial: numero, chave_acesso: chaveAcesso },
      { where: { id_nf: notaFiscalId } }
    );

    return xml;
  }

  private validarCamposObrigatorios(nf: NotaFiscal): void {
    if (!nf.serie) throw new BusinessException('Série não informada');
    if (!nf.modelo) throw new BusinessException('Modelo não informado');
    if (!nf.natureza_operacao) throw new BusinessException('Natureza da operação não informada');
    if (!nf.data_emissao) throw new BusinessException('Data de emissão não informada');
    if (!nf.emitente?.cpfcnpj_pessoa) throw new BusinessException('CNPJ/CPF do emitente não informado');

    const itens = (nf as any).itens || [];
    if (itens.length === 0) throw new BusinessException('Nota fiscal deve ter pelo menos um item');
  }

  private getCodigoUF(nf: NotaFiscal): string {
    // Mapa de UFs IBGE
    const ufMap: Record<string, string> = {
      'AC': '12', 'AL': '27', 'AP': '16', 'AM': '13', 'BA': '29', 'CE': '23',
      'DF': '53', 'ES': '32', 'GO': '52', 'MA': '21', 'MT': '51', 'MS': '50',
      'MG': '31', 'PA': '15', 'PB': '25', 'PR': '41', 'PE': '26', 'PI': '22',
      'RJ': '33', 'RN': '24', 'RS': '43', 'RO': '11', 'RR': '14', 'SC': '42',
      'SP': '35', 'SE': '28', 'TO': '17',
    };
    // Usar UF do emitente ou padrão SP
    return ufMap['SP'] || '35';
  }

  /**
   * Calcula dígito verificador da chave de acesso (módulo 11)
   */
  private calcularDigitoVerificador(chave: string): string {
    const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
    let soma = 0;
    let pesoIdx = 0;

    for (let i = chave.length - 1; i >= 0; i--) {
      soma += parseInt(chave[i]) * pesos[pesoIdx];
      pesoIdx = (pesoIdx + 1) % pesos.length;
    }

    const resto = soma % 11;
    const dv = resto < 2 ? 0 : 11 - resto;
    return String(dv);
  }

  private montarXml(nf: NotaFiscal, numero: number, chaveAcesso: string, cNF: string, tpEmis: string): string {
    const emitente = nf.emitente!;
    const destinatario = (nf as any).destinatario;
    const itens: any[] = (nf as any).itens || [];
    const dataEmissao = new Date(nf.data_emissao).toISOString();
    const cnpjEmitente = (emitente.cpfcnpj_pessoa || '').replace(/\D/g, '');
    const mod = (nf.modelo || '55').padStart(2, '0');
    const serie = (nf.serie || '1').padStart(3, '0');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
    xml += `<NFe xmlns="http://www.portalfiscal.inf.br/nfe">`;
    xml += `<infNFe versao="4.00" Id="NFe${chaveAcesso}">`;

    // IDE - Identificação
    xml += `<ide>`;
    xml += `<cUF>${this.getCodigoUF(nf)}</cUF>`;
    xml += `<cNF>${cNF}</cNF>`;
    xml += `<natOp>${this.escapeXml(nf.natureza_operacao)}</natOp>`;
    xml += `<mod>${mod}</mod>`;
    xml += `<serie>${parseInt(serie)}</serie>`;
    xml += `<nNF>${numero}</nNF>`;
    xml += `<dhEmi>${dataEmissao}</dhEmi>`;
    xml += `<tpNF>${nf.tipo === 'saida' ? '1' : '0'}</tpNF>`;
    xml += `<idDest>1</idDest>`;
    xml += `<cMunFG>3550308</cMunFG>`; // TODO: município do emitente
    xml += `<tpImp>1</tpImp>`;
    xml += `<tpEmis>${tpEmis}</tpEmis>`;
    xml += `<cDV>${chaveAcesso.slice(-1)}</cDV>`;
    xml += `<tpAmb>${nf.ambiente_sefaz === 'producao' ? '1' : '2'}</tpAmb>`;
    xml += `<finNFe>1</finNFe>`;
    xml += `<indFinal>1</indFinal>`;
    xml += `<indPres>1</indPres>`;
    xml += `<procEmi>0</procEmi>`;
    xml += `<verProc>RuralIn-1.0</verProc>`;
    xml += `</ide>`;

    // EMIT - Emitente
    xml += `<emit>`;
    xml += cnpjEmitente.length <= 11
      ? `<CPF>${cnpjEmitente}</CPF>`
      : `<CNPJ>${cnpjEmitente}</CNPJ>`;
    xml += `<xNome>${this.escapeXml(emitente.nomerazao_pessoa || '')}</xNome>`;
    if (emitente.inscricaoEstadual_pessoa) {
      xml += `<IE>${emitente.inscricaoEstadual_pessoa.replace(/\D/g, '')}</IE>`;
    }
    xml += `<CRT>1</CRT>`; // Simples Nacional
    xml += `<enderEmit>`;
    xml += `<xLgr>${this.escapeXml(emitente.endereco_pessoa || 'NAO INFORMADO')}</xLgr>`;
    xml += `<nro>SN</nro>`;
    xml += `<xMun>SAO PAULO</xMun>`; // TODO: nome do município
    xml += `<UF>SP</UF>`; // TODO: UF do emitente
    xml += `<CEP>${(emitente.cep_pessoa || '00000000').replace(/\D/g, '')}</CEP>`;
    xml += `<cMun>3550308</cMun>`; // TODO: código IBGE
    xml += `<cPais>1058</cPais>`;
    xml += `<xPais>BRASIL</xPais>`;
    xml += `</enderEmit>`;
    xml += `</emit>`;

    // DEST - Destinatário
    if (destinatario) {
      const cnpjDest = (destinatario.cpfcnpj_pessoa || '').replace(/\D/g, '');
      xml += `<dest>`;
      xml += cnpjDest.length <= 11
        ? `<CPF>${cnpjDest}</CPF>`
        : `<CNPJ>${cnpjDest}</CNPJ>`;
      xml += `<xNome>${this.escapeXml(destinatario.nomerazao_pessoa || '')}</xNome>`;
      if (destinatario.inscricaoEstadual_pessoa) {
        xml += `<indIEDest>1</indIEDest>`;
        xml += `<IE>${destinatario.inscricaoEstadual_pessoa.replace(/\D/g, '')}</IE>`;
      } else {
        xml += `<indIEDest>9</indIEDest>`;
      }
      xml += `<enderDest>`;
      xml += `<xLgr>${this.escapeXml(destinatario.endereco_pessoa || 'NAO INFORMADO')}</xLgr>`;
      xml += `<nro>SN</nro>`;
      xml += `<xMun>SAO PAULO</xMun>`;
      xml += `<UF>SP</UF>`;
      xml += `<CEP>${(destinatario.cep_pessoa || '00000000').replace(/\D/g, '')}</CEP>`;
      xml += `<cMun>3550308</cMun>`;
      xml += `<cPais>1058</cPais>`;
      xml += `<xPais>BRASIL</xPais>`;
      xml += `</enderDest>`;
      xml += `</dest>`;
    }

    // DET - Itens
    let vlTotalProdutos = 0;
    itens.forEach((item: any, idx: number) => {
      const vlProd = Number(item.vl_total) || (Number(item.quantidade) * Number(item.vl_unitario));
      vlTotalProdutos += vlProd;

      xml += `<det nItem="${idx + 1}">`;
      xml += `<prod>`;
      xml += `<cProd>${item.produtoId}</cProd>`;
      xml += `<cEAN>SEM GTIN</cEAN>`;
      xml += `<xProd>${this.escapeXml(item.descricao || item.produto?.descricao_prod || 'PRODUTO')}</xProd>`;
      xml += `<NCM>${item.ncm || '00000000'}</NCM>`;
      xml += `<CFOP>${item.cfop || nf.cfop || '5102'}</CFOP>`;
      xml += `<uCom>${this.escapeXml(item.unidade || 'UN')}</uCom>`;
      xml += `<qCom>${Number(item.quantidade).toFixed(4)}</qCom>`;
      xml += `<vUnCom>${Number(item.vl_unitario).toFixed(10)}</vUnCom>`;
      xml += `<vProd>${vlProd.toFixed(2)}</vProd>`;
      xml += `<cEANTrib>SEM GTIN</cEANTrib>`;
      xml += `<uTrib>${this.escapeXml(item.unidade || 'UN')}</uTrib>`;
      xml += `<qTrib>${Number(item.quantidade).toFixed(4)}</qTrib>`;
      xml += `<vUnTrib>${Number(item.vl_unitario).toFixed(10)}</vUnTrib>`;
      xml += `<indTot>1</indTot>`;
      xml += `</prod>`;

      // Impostos
      xml += `<imposto>`;
      xml += `<ICMS><ICMS00>`;
      xml += `<orig>0</orig>`;
      xml += `<CST>00</CST>`;
      xml += `<modBC>3</modBC>`;
      xml += `<vBC>${vlProd.toFixed(2)}</vBC>`;
      xml += `<pICMS>${Number(item.icms_aliquota || 0).toFixed(4)}</pICMS>`;
      xml += `<vICMS>${Number(item.icms_valor || 0).toFixed(2)}</vICMS>`;
      xml += `</ICMS00></ICMS>`;
      xml += `<PIS><PISAliq>`;
      xml += `<CST>01</CST>`;
      xml += `<vBC>${vlProd.toFixed(2)}</vBC>`;
      xml += `<pPIS>${Number(item.pis_aliquota || 0).toFixed(4)}</pPIS>`;
      xml += `<vPIS>${Number(item.pis_valor || 0).toFixed(2)}</vPIS>`;
      xml += `</PISAliq></PIS>`;
      xml += `<COFINS><COFINSAliq>`;
      xml += `<CST>01</CST>`;
      xml += `<vBC>${vlProd.toFixed(2)}</vBC>`;
      xml += `<pCOFINS>${Number(item.cofins_aliquota || 0).toFixed(4)}</pCOFINS>`;
      xml += `<vCOFINS>${Number(item.cofins_valor || 0).toFixed(2)}</vCOFINS>`;
      xml += `</COFINSAliq></COFINS>`;
      xml += `</imposto>`;
      xml += `</det>`;
    });

    // TOTAL
    const vlDesc = Number(nf.vl_desconto) || 0;
    const vlFrete = Number(nf.vl_frete) || 0;
    const vlOutros = Number(nf.vl_outros) || 0;
    const vlNF = Number(nf.vl_total) || vlTotalProdutos;

    xml += `<total><ICMSTot>`;
    xml += `<vBC>${vlTotalProdutos.toFixed(2)}</vBC>`;
    xml += `<vICMS>${Number(nf.vl_icms || 0).toFixed(2)}</vICMS>`;
    xml += `<vICMSDeson>0.00</vICMSDeson>`;
    xml += `<vFCPUFDest>0.00</vFCPUFDest>`;
    xml += `<vICMSUFDest>0.00</vICMSUFDest>`;
    xml += `<vICMSUFRemet>0.00</vICMSUFRemet>`;
    xml += `<vFCP>0.00</vFCP>`;
    xml += `<vBCST>0.00</vBCST>`;
    xml += `<vST>0.00</vST>`;
    xml += `<vFCPST>0.00</vFCPST>`;
    xml += `<vFCPSTRet>0.00</vFCPSTRet>`;
    xml += `<vProd>${vlTotalProdutos.toFixed(2)}</vProd>`;
    xml += `<vFrete>${vlFrete.toFixed(2)}</vFrete>`;
    xml += `<vSeg>0.00</vSeg>`;
    xml += `<vDesc>${vlDesc.toFixed(2)}</vDesc>`;
    xml += `<vII>0.00</vII>`;
    xml += `<vIPI>0.00</vIPI>`;
    xml += `<vIPIDevol>0.00</vIPIDevol>`;
    xml += `<vPIS>${Number(nf.vl_pis || 0).toFixed(2)}</vPIS>`;
    xml += `<vCOFINS>${Number(nf.vl_cofins || 0).toFixed(2)}</vCOFINS>`;
    xml += `<vOutro>${vlOutros.toFixed(2)}</vOutro>`;
    xml += `<vNF>${vlNF.toFixed(2)}</vNF>`;
    xml += `</ICMSTot></total>`;

    // TRANSP
    xml += `<transp><modFrete>9</modFrete></transp>`;

    // PAG
    xml += `<pag><detPag>`;
    xml += `<tPag>90</tPag>`; // Sem pagamento
    xml += `<vPag>0.00</vPag>`;
    xml += `</detPag></pag>`;

    // INFADIC
    const observacoes = (nf as any).observacoes || (nf as any).observacao;
    if (observacoes) {
      xml += `<infAdic><infCpl>${this.escapeXml(observacoes)}</infCpl></infAdic>`;
    }

    xml += `</infNFe></NFe>`;

    return xml;
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
