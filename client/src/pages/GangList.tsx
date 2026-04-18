import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { getGangs, createGang, deleteGang, requestJoinGang } from '../api/gangs.api'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'

export default function GangListPage() {
  const user        = useAuthStore(s => s.user)
  const setGangs    = useAuthStore(s => s.setGangs)
  const storeGangs  = useAuthStore(s => s.gangs)
  const navigate    = useNavigate()
  const [gangs, setLocalGangs]   = useState<any[]>([])
  const [loading, setLoading]    = useState(true)
  const [newName, setNewName]    = useState('')
  const [creating, setCreating]  = useState(false)
  const { toast, showToast, hideToast } = useToast()

  const isMaster = user?.role === 'MASTER' || user?.role === 'ADMIN'

  const load = async () => {
    try {
      const data = await getGangs()
      setLocalGangs(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      await createGang(newName.trim())
      setNewName('')
      await load()
      showToast('Gang created!')
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Failed to create gang', 'error')
    } finally { setCreating(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete gang "${name}"? This cannot be undone.`)) return
    try {
      await deleteGang(id)
      await load()
      showToast('Gang deleted')
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Failed to delete', 'error')
    }
  }

  const handleJoin = async (id: string) => {
    try {
      const result = await requestJoinGang(id)
      await load()
      showToast('Join request sent! Waiting for approval.')
      if (result?.gangWhatsappLink) {
        window.open(result.gangWhatsappLink, '_blank')
      }
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Failed to request', 'error')
    }
  }

  if (loading) return <div style={{ color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>Loading...</div>

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h1 style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1rem' }}>🏴 Gangs</h1>

      {/* Create gang — MASTER only */}
      {isMaster && (
        <div className="card" style={{ marginBottom: '1rem', display: 'flex', gap: 8 }}>
          <input
            placeholder="New gang name..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            style={{ flex: 1, background: '#1a1a2e', color: 'white', border: '1px solid #4b5563', borderRadius: '0.5rem', padding: '0.375rem 0.75rem' }}
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer', fontWeight: 600 }}
          >
            {creating ? '...' : '+ Create'}
          </button>
        </div>
      )}

      {gangs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: '#9ca3af' }}>No gangs yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {gangs.map((g: any) => {
            const myStatus   = g.myStatus ?? (storeGangs.find(sg => sg.id === g.id) ? 'APPROVED' : null)
            const isApproved = myStatus === 'APPROVED'
            const isPending  = myStatus === 'PENDING'
            const isRejected = myStatus === 'REJECTED'

            return (
              <div key={g.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p
                    onClick={() => isApproved && navigate(`/gangs/${g.id}`)}
                    style={{ color: 'white', fontWeight: 600, cursor: isApproved ? 'pointer' : 'default' }}
                  >{g.name}</p>
                  <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                    {isMaster ? `${g.members?.filter((m: any) => m.status === 'APPROVED').length ?? g.memberCount ?? 0} members` : `${g.memberCount ?? 0} members`}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {isApproved && (
                    <button
                      onClick={() => navigate(`/gangs/${g.id}`)}
                      style={{ background: '#374151', color: 'white', border: '1px solid #4b5563', borderRadius: '0.5rem', padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}
                    >View</button>
                  )}
                  {!isMaster && !isApproved && !isPending && (
                    <button
                      onClick={() => handleJoin(g.id)}
                      style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                    >Request to Join</button>
                  )}
                  {isPending  && <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>⏳ Pending</span>}
                  {isRejected && (
                    <button
                      onClick={() => handleJoin(g.id)}
                      style={{ background: '#374151', color: '#ef4444', border: '1px solid #7f1d1d', borderRadius: '0.5rem', padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}
                    >Re-apply</button>
                  )}
                  {isMaster && (
                    <button
                      onClick={() => handleDelete(g.id, g.name)}
                      style={{ background: 'none', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                    >✕</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
