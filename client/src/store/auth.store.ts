import { create } from 'zustand'
import axios from 'axios'
import api from '../api/axios'

interface User {
  id: string
  nickname: string
  role: 'ADMIN' | 'PLAYER'
}

interface AuthState {
  user: User | null
  loading: boolean
  requestOtp: (phone: string) => Promise<void>
  verifyOtp:  (phone: string, otp: string) => Promise<void>
  logout:     () => void
  loadUser:   () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  requestOtp: async (phone) => {
    await api.post('/auth/request-otp', { phone })
  },

  verifyOtp: async (phone, otp) => {
    const { data } = await api.post('/auth/verify-otp', { phone, otp })
    localStorage.setItem('accessToken',  data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    set({ user: data.user })
  },

  logout: () => {
    localStorage.clear()
    set({ user: null })
  },

  loadUser: async () => {
    const accessToken  = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')

    if (!accessToken && !refreshToken) {
      set({ loading: false })
      return
    }

    try {
      // Try with current access token
      const { data } = await api.get('/users/me')
      set({ user: { id: data.id, nickname: data.nickname, role: data.role }, loading: false })
    } catch {
      // Try refreshing
      try {
        const { data: refreshData } = await axios.post('/api/auth/refresh', { refreshToken })
        localStorage.setItem('accessToken',  refreshData.accessToken)
        localStorage.setItem('refreshToken', refreshData.refreshToken)
        const { data } = await api.get('/users/me')
        set({ user: { id: data.id, nickname: data.nickname, role: data.role }, loading: false })
      } catch {
        localStorage.clear()
        set({ user: null, loading: false })
      }
    }
  },
}))