/**
 * Enums para Ordem de Serviço
 */

/**
 * Status da Ordem de Serviço
 */
export enum StatusOrdemServico {
  PLANEJADA = 'PLANEJADA',
  ATRIBUIDA = 'ATRIBUIDA',
  EM_EXECUCAO = 'EM_EXECUCAO',
  CONCLUIDA = 'CONCLUIDA',
  VALIDADA = 'VALIDADA',
  CANCELADA = 'CANCELADA',
}

/**
 * Prioridade da Ordem de Serviço
 */
export enum PrioridadeOrdemServico {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE',
}

/**
 * Categoria de Atividade da OS
 */
export enum CategoriaAtividadeOS {
  AGRICOLA = 'AGRICOLA',
  PECUARIA = 'PECUARIA',
  ADMINISTRATIVA = 'ADMINISTRATIVA',
  MANUTENCAO = 'MANUTENCAO',
}

/**
 * Tipo de Campo Condicional
 */
export enum TipoCampoCondicional {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
}

/**
 * Função do Responsável na OS
 */
export enum FuncaoResponsavelOS {
  RESPONSAVEL = 'RESPONSAVEL',
  OPERADOR = 'OPERADOR',
  AUXILIAR = 'AUXILIAR',
  FISCAL = 'FISCAL',
}
