import { apiClient, setTokens, clearTokens, getRefreshToken } from './client'
import type { LoginRequest, RegisterRequest, AuthResponse } from './types'

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data)
    const { accessToken, refreshToken } = response.data
    setTokens(accessToken, refreshToken)
    return response.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    const { accessToken, refreshToken } = response.data
    setTokens(accessToken, refreshToken)
    return response.data
  },

  async logout(): Promise<void> {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refreshToken })
      } catch {
        // Ignore logout errors
      }
    }
    clearTokens()
  },

  async refresh(): Promise<AuthResponse> {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    const response = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken })
    const { accessToken, refreshToken: newRefreshToken } = response.data
    setTokens(accessToken, newRefreshToken)
    return response.data
  },
}
