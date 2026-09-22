import { ParsedNfeDto } from '../../dto/nfe/ParsedNfeDto'

/**
 * Interface para serviço de parsing de XML NF-e 4.0
 *
 * Extrai dados estruturados de um XML NF-e e retorna ParsedNfeDto.
 */
export interface INfeXmlParserService {
  /**
   * Faz parsing de um XML NF-e 4.0 e retorna dados estruturados
   * @param xmlContent Conteúdo XML da NF-e como string
   * @returns ParsedNfeDto com dados extraídos
   * @throws BusinessException se XML for inválido ou mal formado
   */
  parseXml(xmlContent: string): Promise<ParsedNfeDto>
}
