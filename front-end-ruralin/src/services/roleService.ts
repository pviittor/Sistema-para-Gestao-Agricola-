import type { Role } from '@/types/Role'
import api from './api'

export interface PaginatedResult<T> {
    data: T[]
    page: number
    limit: number
    total: number
    totalPages: number
}

export const roleService = {
    getAll: async () => {
        const { data } = await api.get<PaginatedResult<Role>>('/roles?limit=100')
        return data.data
    },
}
