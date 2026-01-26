import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse } from '@/api/types'
import { authApi, clearTokens, getAccessToken } from '@/api'

interface User {
  email: string
  organizationId: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions - using functional setState for stable callbacks (react-best-practices)
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, organizationName: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (response: AuthResponse) => void
  clearError: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.login({ email, password })
          get().setUser(response)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      register: async (email: string, password: string, organizationName: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.register({ email, password, organizationName })
          get().setUser(response)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Registration failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await authApi.logout()
        } catch {
          // Ignore logout errors
        } finally {
          clearTokens()
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      setUser: (response: AuthResponse) => {
        set({
          user: {
            email: response.email,
            organizationId: response.organizationId,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      },

      clearError: () => set({ error: null }),

      checkAuth: () => {
        const token = getAccessToken()
        const currentUser = get().user
        if (token && currentUser) {
          set({ isAuthenticated: true })
        } else {
          set({ isAuthenticated: false, user: null })
        }
      },
    }),
    {
      name: 'pss-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
