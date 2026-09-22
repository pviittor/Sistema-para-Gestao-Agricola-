import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import router from '@/router'

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const api = axios.create({
  baseURL: import.meta.env.VITE_RURALIN_API_URL || 'https://api-teste.ruralin.cloud/api',
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: unknown) => void }> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequest

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Se o próprio endpoint de refresh retornou 401, encerra a sessão
    if (originalRequest.url?.includes('/auth/refresh')) {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      router.push({ name: 'login' })
      return Promise.reject(error)
    }

    // Fila de requisições paralelas enquanto o refresh acontece
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    const storedRefreshToken = localStorage.getItem('refreshToken')
    if (!storedRefreshToken) {
      localStorage.removeItem('token')
      router.push({ name: 'login' })
      return Promise.reject(error)
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post<{ token: string; refreshToken: string }>(
        `${api.defaults.baseURL}/auth/refresh`,
        { refreshToken: storedRefreshToken },
      )

      localStorage.setItem('token', data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      api.defaults.headers.common.Authorization = `Bearer ${data.token}`
      originalRequest.headers.Authorization = `Bearer ${data.token}`

      processQueue(null, data.token)
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      router.push({ name: 'login' })
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
