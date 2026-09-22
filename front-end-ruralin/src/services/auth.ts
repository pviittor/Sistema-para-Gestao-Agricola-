import api from './api'

export interface LoginResponse {
  user: {
    id: number
    email: string
    nome: string
    apiUrl: string
  }
  token: string
  refreshToken: string
}

export interface RefreshResponse {
  token: string
  refreshToken: string
}

export async function login(email: string, senha: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', { email, senha })

  if (response.data.token) {
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('refreshToken', response.data.refreshToken)
  }

  return response.data
}

export async function refreshToken(refreshToken: string): Promise<RefreshResponse> {
  const response = await api.post<RefreshResponse>('/auth/refresh', { refreshToken })

  if (response.data.token) {
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('refreshToken', response.data.refreshToken)
  }

  return response.data
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  window.location.href = '/login'
}

export function getUserIdFromToken(): number | null {
  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64Url = parts[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join(''),
    )

    const payload = JSON.parse(jsonPayload)
    return payload.user_id || payload.id || payload.sub || null
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}
