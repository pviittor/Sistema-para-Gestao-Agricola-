export interface PrincipioAtivo {
  id_principio?: number
  tenantId?: number
  descricao_principio: string
  classe_principio: string
  usercreation?: number
  datecreation?: Date
  usuarioCriador?: any // Using any for now or I can import Usuario type if needed, but simple interface is enough
}
