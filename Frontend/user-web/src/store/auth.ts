import { create } from 'zustand'

interface AuthState {
  token: string | null
  refreshToken: string | null
  userId: number | null
  login: (token: string, refreshToken: string, userId: number) => void
  setTokens: (token: string, refreshToken: string) => void
  logout: () => void
  clear: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  userId: Number(localStorage.getItem('userId')) || null,

  login(token: string, refreshToken: string, userId: number) {
    localStorage.setItem('token', token)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('userId', String(userId))
    set({ token, refreshToken, userId })
  },

  setTokens(token: string, refreshToken: string) {
    localStorage.setItem('token', token)
    localStorage.setItem('refreshToken', refreshToken)
    set({ token, refreshToken })
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userId')
    set({ token: null, refreshToken: null, userId: null })
  },

  clear() {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userId')
    set({ token: null, refreshToken: null, userId: null })
  },

  isAuthenticated() {
    return !!get().token
  },
}))
