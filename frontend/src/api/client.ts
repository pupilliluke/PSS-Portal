import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { AuthResponse, ApiError } from './types'
import { API_URL } from '@/lib/constants'

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Log API URL in development
if (import.meta.env.DEV) {
  console.log('[API] Base URL:', API_URL)
}

// Token storage keys
const ACCESS_TOKEN_KEY = 'pss_access_token'
const REFRESH_TOKEN_KEY = 'pss_refresh_token'

// Token management - following react-best-practices: cache storage reads
let cachedAccessToken: string | null = null
let cachedRefreshToken: string | null = null

export function getAccessToken(): string | null {
  if (cachedAccessToken === null) {
    cachedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
  }
  return cachedAccessToken
}

export function getRefreshToken(): string | null {
  if (cachedRefreshToken === null) {
    cachedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  }
  return cachedRefreshToken
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  cachedAccessToken = accessToken
  cachedRefreshToken = refreshToken
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  cachedAccessToken = null
  cachedRefreshToken = null
}

// Request interceptor - add auth header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle token refresh
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config

    // If 401 and not already retrying
    if (error.response?.status === 401 && originalRequest && !originalRequest.headers['X-Retry']) {
      const refreshToken = getRefreshToken()

      if (!refreshToken) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Wait for token refresh
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            originalRequest.headers['X-Retry'] = 'true'
            resolve(apiClient(originalRequest))
          })
        })
      }

      isRefreshing = true

      try {
        const response = await axios.post<AuthResponse>(`${API_URL}/auth/refresh`, {
          refreshToken,
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data
        setTokens(accessToken, newRefreshToken)
        onTokenRefreshed(accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        originalRequest.headers['X-Retry'] = 'true'
        return apiClient(originalRequest)
      } catch (refreshError) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
