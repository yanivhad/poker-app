import api from './axios'

export const getGangs         = () => api.get('/gangs').then(r => r.data)
export const createGang       = (name: string) => api.post('/gangs', { name }).then(r => r.data)
export const deleteGang       = (id: string) => api.delete(`/gangs/${id}`).then(r => r.data)
export const getGangDetail    = (id: string) => api.get(`/gangs/${id}`).then(r => r.data)
export const updateGang       = (id: string, data: { name?: string; phone?: string | null }) => api.put(`/gangs/${id}`, data).then(r => r.data)
export const getGangMembers   = (id: string) => api.get(`/gangs/${id}/members`).then(r => r.data)
export const requestJoinGang  = (id: string) => api.post(`/gangs/${id}/join`).then(r => r.data)
export const updateGangMember = (gangId: string, userId: string, data: any) => api.patch(`/gangs/${gangId}/members/${userId}`, data).then(r => r.data)
export const removeGangMember = (gangId: string, userId: string) => api.delete(`/gangs/${gangId}/members/${userId}`).then(r => r.data)
