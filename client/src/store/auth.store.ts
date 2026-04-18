import { create } from 'zustand'
import axios from 'axios'
import api, { BASE_URL } from '../api/axios'

interface User {
  id: string
  nickname: string
  role: 'MASTER' | 'ADMIN' | 'PLAYER'
}

export interface Gang {
  id:           string
  name:         string
  role:         'ADMIN' | 'MEMBER'
  whatsappLink: string | null
}

interface AuthState {
  user:       User | null
  gangs:      Gang[]
  activeGang: Gang | null
  loading:    boolean
  login:         (nickname: string, password: string) => Promise<void>
  logout:        () => void
  loadUser:      () => Promise<void>
  setActiveGang: (gangId: string) => void
  setGangs:      (gangs: Gang[]) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:       null,
  gangs:      [],
  activeGang: null,
  loading:    true,

  setGangs: (gangs) => {
    const savedId   = localStorage.getItem('activeGangId')
    const active    = gangs.find(g => g.id === savedId) ?? (gangs.length === 1 ? gangs[0] : null)
    if (active) localStorage.setItem('activeGangId', active.id)
    set({ gangs, activeGang: active })
  },

  setActiveGang: (gangId) => {
    const gang = get().gangs.find(g => g.id === gangId)
    if (!gang) return
    localStorage.setItem('activeGangId', gangId)
    set({ activeGang: gang })
  },

  login: async (nickname, password) => {
    const { data } = await api.post('/auth/login', { nickname, password })
    localStorage.setItem('accessToken',  data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    const gangs: Gang[] = data.gangs ?? []
    const savedId       = localStorage.getItem('activeGangId')
    const activeGang    = gangs.find(g => g.id === savedId) ?? (gangs.length === 1 ? gangs[0] : null)
    if (activeGang) localStorage.setItem('activeGangId', activeGang.id)
    set({ user: data.user, gangs, activeGang })
  },

  logout: () => {
    api.post('/auth/logout').catch(() => {})
    localStorage.clear()
    set({ user: null, gangs: [], activeGang: null })
  },

  loadUser: async () => {
    const accessToken  = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')

    if (!accessToken && !refreshToken) {
      set({ loading: false })
      return
    }

    const hydrateGangs = (gangsData: Gang[]) => {
      const savedId    = localStorage.getItem('activeGangId')
      const activeGang = gangsData.find(g => g.id === savedId) ?? (gangsData.length === 1 ? gangsData[0] : null)
      if (activeGang) localStorage.setItem('activeGangId', activeGang.id)
      return { gangs: gangsData, activeGang }
    }

    try {
      const { data } = await api.get('/users/me')
      // Fetch gangs separately since /users/me doesn't return them
      const gangsRes = await api.get('/gangs').catch(() => ({ data: [] }))
      const gangsData: Gang[] = Array.isArray(gangsRes.data)
        ? gangsRes.data.filter((g: any) => g.myStatus === 'APPROVED' || g.role).map((g: any) => ({
            id:           g.id,
            name:         g.name,
            role:         g.role ?? 'MEMBER',
            whatsappLink: g.whatsappLink ?? null,
          }))
        : []
      set({ user: { id: data.id, nickname: data.nickname, role: data.role }, ...hydrateGangs(gangsData), loading: false })
    } catch {
      try {
        const { data: refreshData } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        localStorage.setItem('accessToken',  refreshData.accessToken)
        localStorage.setItem('refreshToken', refreshData.refreshToken)
        const { data } = await api.get('/users/me')
        const gangsRes = await api.get('/gangs').catch(() => ({ data: [] }))
        const gangsData: Gang[] = Array.isArray(gangsRes.data)
          ? gangsRes.data.filter((g: any) => g.myStatus === 'APPROVED' || g.role).map((g: any) => ({
              id:           g.id,
              name:         g.name,
              role:         g.role ?? 'MEMBER',
              whatsappLink: g.whatsappLink ?? null,
            }))
          : []
        set({ user: { id: data.id, nickname: data.nickname, role: data.role }, ...hydrateGangs(gangsData), loading: false })
      } catch {
        localStorage.clear()
        set({ user: null, gangs: [], activeGang: null, loading: false })
      }
    }
  },
}))
