export enum CategoriaAtividadeOS {
  AGRICOLA = 'AGRICOLA',
  PECUARIA = 'PECUARIA',
  ADMINISTRATIVA = 'ADMINISTRATIVA',
  MANUTENCAO = 'MANUTENCAO',
}

export enum TipoCampoCondicional {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
}

export interface CampoCondicionalTipoAtividade {
  id: number
  nomeCampo: string
  rotulo: string
  tipoCampo: TipoCampoCondicional
  obrigatorio: boolean
  opcoes: any[] | null
  unidade: string | null
  ordem: number
  ativo: boolean
}

export interface TipoAtividadeOS {
  id: number
  nome: string
  descricao: string | null
  categoria: CategoriaAtividadeOS
  icone: string | null
  cor: string | null
  ativo: boolean
  camposCondicionais: CampoCondicionalTipoAtividade[]
}

export interface CreateTipoAtividadeOSPayload {
  nome: string
  descricao?: string
  categoria: CategoriaAtividadeOS
  icone?: string
  cor?: string
  ativo?: boolean
  camposCondicionais?: Omit<CampoCondicionalTipoAtividade, 'id'>[]
}
