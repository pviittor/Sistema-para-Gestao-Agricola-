import { Injectable, Inject } from '../../../core/di'
import { TYPES } from '../../../core/di/types'
import { INfeSefazService } from './INfeSefazService'
import { INfeXmlParserService } from './INfeXmlParserService'
import { ICertificadoDigitalRepository } from '../../../infrastructure/repository/ICertificadoDigitalRepository'
import { ParsedNfeDto } from '../../dto/nfe/ParsedNfeDto'
import { StatusServicoDto } from '../../dto/nfe/StatusServicoDto'
import { RetornoSefazDto } from '../../dto/nfe/RetornoSefazDto'
import { BusinessException } from '../../../core/exceptions/BusinessException'
import { NotFoundException } from '../../../core/exceptions/NotFoundException'
import * as fs from 'fs'

/** Estado de contingência por tenant (in-memory) */
interface ContingenciaState {
  tipo: string
  justificativa: string
  dataInicio: string
}

const contingenciaMap = new Map<number, ContingenciaState>()

/**
 * Serviço de consulta à SEFAZ
 *
 * Consulta NF-e na SEFAZ usando certificado digital A1 do tenant.
 * Usa node-nfe para comunicação com webservice SEFAZ.
 *
 * IMPORTANTE: Testar apenas em ambiente de homologação.
 */
@Injectable()
export class NfeSefazService implements INfeSefazService {

  constructor(
    @Inject(TYPES.ICertificadoDigitalRepository)
    private certificadoDigitalRepository: ICertificadoDigitalRepository,
    @Inject(TYPES.INfeXmlParserService)
    private nfeXmlParserService: INfeXmlParserService
  ) {}

  /**
   * Consulta NF-e na SEFAZ pela chave de acesso
   *
   * Lê certificado A1 do filesystem, valida validade e faz consulta.
   * Retorna ParsedNfeDto com dados da NF-e consultada.
   */
  async consultarPorChave(chaveAcesso: string, certificadoId: number): Promise<ParsedNfeDto> {
    if (!chaveAcesso || chaveAcesso.length !== 44) {
      throw new BusinessException(
        'Chave de acesso deve ter exatamente 44 dígitos numéricos',
        'CHAVE_ACESSO_INVALIDA'
      )
    }

    // Buscar certificado digital
    const certificado = await this.certificadoDigitalRepository.findById(certificadoId)
    if (!certificado) {
      throw new NotFoundException('Certificado digital', String(certificadoId))
    }

    // Validar que certificado não está expirado
    if (certificado.data_validade && new Date(certificado.data_validade) < new Date()) {
      throw new BusinessException(
        'Certificado digital expirado. Faça upload de um certificado válido',
        'CERTIFICADO_EXPIRADO'
      )
    }

    // Validar que arquivo do certificado existe
    if (!certificado.arquivo_path || !fs.existsSync(certificado.arquivo_path)) {
      throw new BusinessException(
        'Arquivo do certificado digital não encontrado no servidor',
        'CERTIFICADO_ARQUIVO_NAO_ENCONTRADO'
      )
    }

    // Ler certificado
    const pfxBuffer = fs.readFileSync(certificado.arquivo_path)
    const senha = certificado.senha || ''

    try {
      // Importar node-nfe para consulta SEFAZ
      const { NFe } = require('node-nfe')

      // TODO: Integração real com SEFAZ será completada no Sprint 9
      // Por enquanto, lança exceção informativa
      throw new BusinessException(
        'Consulta SEFAZ ainda não disponível. A integração completa será implementada no Sprint 9. ' +
        'Use a importação de arquivo XML como alternativa.',
        'SEFAZ_NAO_IMPLEMENTADO'
      )
    } catch (error: any) {
      if (error instanceof BusinessException) throw error

      throw new BusinessException(
        `Erro ao consultar SEFAZ: ${error.message}`,
        'SEFAZ_ERRO_CONSULTA'
      )
    }
  }

  /**
   * Consulta status do serviço SEFAZ para uma UF
   */
  async consultarStatusServico(uf: string, ambiente: string): Promise<StatusServicoDto> {
    if (!uf || uf.length !== 2) {
      throw new BusinessException('UF deve ter exatamente 2 caracteres', 'UF_INVALIDA')
    }

    const ambientesValidos = ['homologacao', 'producao']
    if (!ambientesValidos.includes(ambiente)) {
      throw new BusinessException(
        'Ambiente deve ser "homologacao" ou "producao"',
        'AMBIENTE_INVALIDO'
      )
    }

    const dto = new StatusServicoDto()
    dto.uf = uf.toUpperCase()
    dto.ambiente = ambiente
    dto.dataConsulta = new Date().toISOString()

    try {
      // TODO: Integração real com SEFAZ via node-nfe
      dto.disponivel = false
      dto.motivo = 'Consulta de status SEFAZ em implementação'
      return dto
    } catch (error: any) {
      dto.disponivel = false
      dto.motivo = `Erro ao consultar status: ${error.message}`
      return dto
    }
  }

  /**
   * Transmite XML NF-e assinado para SEFAZ
   * Em homologação, simula resposta. Em produção, usa node-nfe/SOAP.
   */
  async transmitir(xmlAssinado: string, uf: string, ambiente: string): Promise<RetornoSefazDto> {
    if (!xmlAssinado) {
      throw new BusinessException('XML assinado é obrigatório', 'XML_VAZIO')
    }

    const retorno = new RetornoSefazDto()
    retorno.dataProcessamento = new Date().toISOString()

    try {
      // Extrair chave de acesso do XML
      const chaveMatch = xmlAssinado.match(/Id="NFe(\d{44})"/)
      retorno.chaveAcesso = chaveMatch ? chaveMatch[1] : null

      if (ambiente === 'homologacao') {
        // Simulação de resposta SEFAZ em homologação
        retorno.status = 'autorizada'
        retorno.motivo = 'Autorizado o uso da NF-e (homologação simulada)'
        retorno.protocolo = `${Date.now()}`
        retorno.codigoStatus = 100
        retorno.xmlRetorno = xmlAssinado
        return retorno
      }

      // Produção — usar node-nfe para comunicação SOAP real
      try {
        const { NFe } = require('node-nfe')
        // TODO: Implementar chamada SOAP real quando node-nfe estiver configurado
        throw new Error('Transmissão em produção ainda não configurada')
      } catch (nfeError: any) {
        // Fallback: resposta simulada com aviso
        retorno.status = 'rejeitada'
        retorno.motivo = `Transmissão em produção não disponível: ${nfeError.message}`
        retorno.codigoStatus = 999
        return retorno
      }
    } catch (error: any) {
      if (error instanceof BusinessException) throw error
      retorno.status = 'rejeitada'
      retorno.motivo = `Erro ao transmitir: ${error.message}`
      retorno.codigoStatus = 999
      return retorno
    }
  }

  /**
   * Consulta processamento de lote por recibo (polling assíncrono)
   */
  async consultarProcessamento(recibo: string, uf: string, ambiente: string): Promise<RetornoSefazDto> {
    const retorno = new RetornoSefazDto()
    retorno.dataProcessamento = new Date().toISOString()

    if (ambiente === 'homologacao') {
      retorno.status = 'autorizada'
      retorno.motivo = 'Processamento concluído (homologação simulada)'
      retorno.codigoStatus = 100
      return retorno
    }

    // Polling com intervalo de 3s, máximo 5 tentativas
    for (let tentativa = 1; tentativa <= 5; tentativa++) {
      try {
        // TODO: Consulta SOAP real via node-nfe
        retorno.status = 'em_processamento'
        retorno.motivo = `Tentativa ${tentativa}/5 - aguardando processamento`
        retorno.codigoStatus = 105

        if (tentativa < 5) {
          await new Promise(resolve => setTimeout(resolve, 3000))
        }
      } catch (error: any) {
        retorno.status = 'rejeitada'
        retorno.motivo = `Erro na consulta: ${error.message}`
        retorno.codigoStatus = 999
        return retorno
      }
    }

    retorno.status = 'rejeitada'
    retorno.motivo = 'Timeout: processamento não concluído após 5 tentativas'
    retorno.codigoStatus = 105
    return retorno
  }

  /**
   * Cancela NF-e autorizada na SEFAZ
   */
  async cancelar(chaveAcesso: string, protocolo: string, justificativa: string, certificadoId: number): Promise<RetornoSefazDto> {
    if (!chaveAcesso || chaveAcesso.length !== 44) {
      throw new BusinessException('Chave de acesso inválida', 'CHAVE_INVALIDA')
    }
    if (!protocolo) {
      throw new BusinessException('Protocolo de autorização é obrigatório', 'PROTOCOLO_OBRIGATORIO')
    }
    if (!justificativa || justificativa.length < 15) {
      throw new BusinessException('Justificativa deve ter no mínimo 15 caracteres', 'JUSTIFICATIVA_CURTA')
    }

    const certificado = await this.certificadoDigitalRepository.findById(certificadoId)
    if (!certificado) {
      throw new NotFoundException('Certificado digital', String(certificadoId))
    }

    const retorno = new RetornoSefazDto()
    retorno.dataProcessamento = new Date().toISOString()
    retorno.chaveAcesso = chaveAcesso

    try {
      // TODO: Montar evento de cancelamento XML, assinar e enviar para SEFAZ
      // Por enquanto, simula cancelamento bem-sucedido
      retorno.status = 'cancelada'
      retorno.motivo = 'Cancelamento de NF-e homologado (simulado)'
      retorno.protocolo = `${Date.now()}`
      retorno.codigoStatus = 135
      return retorno
    } catch (error: any) {
      retorno.status = 'rejeitada'
      retorno.motivo = `Erro ao cancelar: ${error.message}`
      retorno.codigoStatus = 999
      return retorno
    }
  }

  /**
   * Inutiliza faixa de numeração na SEFAZ
   */
  async inutilizar(cnpj: string, serie: string, numInicial: number, numFinal: number, justificativa: string, certificadoId: number, uf: string, ambiente: string): Promise<RetornoSefazDto> {
    if (numFinal < numInicial) {
      throw new BusinessException('Número final deve ser >= número inicial', 'FAIXA_INVALIDA')
    }
    if (!justificativa || justificativa.length < 15) {
      throw new BusinessException('Justificativa deve ter no mínimo 15 caracteres', 'JUSTIFICATIVA_CURTA')
    }

    const certificado = await this.certificadoDigitalRepository.findById(certificadoId)
    if (!certificado) {
      throw new NotFoundException('Certificado digital', String(certificadoId))
    }

    const retorno = new RetornoSefazDto()
    retorno.dataProcessamento = new Date().toISOString()

    try {
      // TODO: Montar XML de inutilização, assinar e enviar para SEFAZ
      retorno.status = 'inutilizada'
      retorno.motivo = `Inutilização de faixa ${numInicial}-${numFinal} homologada (simulado)`
      retorno.protocolo = `${Date.now()}`
      retorno.codigoStatus = 102
      return retorno
    } catch (error: any) {
      retorno.status = 'rejeitada'
      retorno.motivo = `Erro ao inutilizar: ${error.message}`
      retorno.codigoStatus = 999
      return retorno
    }
  }

  /**
   * Ativa modo de contingência para o tenant
   */
  async ativarContingencia(tipo: string, justificativa: string, tenantId: number): Promise<void> {
    const tiposValidos = ['SVC-AN', 'SVC-RS']
    if (!tiposValidos.includes(tipo)) {
      throw new BusinessException(`Tipo de contingência inválido. Válidos: ${tiposValidos.join(', ')}`, 'TIPO_CONTINGENCIA_INVALIDO')
    }
    if (!justificativa) {
      throw new BusinessException('Justificativa é obrigatória para ativar contingência', 'JUSTIFICATIVA_OBRIGATORIA')
    }

    contingenciaMap.set(tenantId, {
      tipo,
      justificativa,
      dataInicio: new Date().toISOString(),
    })
  }

  /**
   * Desativa modo de contingência
   */
  async desativarContingencia(tenantId: number): Promise<void> {
    contingenciaMap.delete(tenantId)
  }

  /**
   * Verifica se contingência está ativa
   */
  async isContingenciaAtiva(tenantId: number): Promise<boolean> {
    return contingenciaMap.has(tenantId)
  }
}
