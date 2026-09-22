import api from './api'

export interface UsuarioHasRole {
    usuarioId: number
    roleId: number
    tenantId?: number
    role?: {
        id: number
        nome: string
        createAt: string
        updateAt: string
    }
}

export const usuarioHasRoleService = {
    getByUsuarioId: async (usuarioId: number) => {
        const { data } = await api.get<UsuarioHasRole[]>('/usuario-roles', {
            params: { usuarioId }
        })
        return data
    },

    addRole: async (usuarioId: number, roleId: number) => {
        const { data } = await api.post<UsuarioHasRole>('/usuario-roles', {
            usuarioId,
            roleId
        })
        return data
    },

    removeRole: async (usuarioId: number, roleId: number) => {
        await api.delete(`/usuario-roles/${usuarioId}/${roleId}`)
    }
}
