import type { Role } from "@/types/Role"

export interface Usuario {
  id?: number
  apiKey: string
  apiUrl: string
  tipo: string
  username: string
  nome: string
  email: string
  whatsapp: string
  senha?: string
  roles?: Role[]
}
