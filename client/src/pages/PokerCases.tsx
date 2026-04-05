import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/auth.store'
import api from '../api/axios'
import Spinner from '../components/ui/Spinner'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'

export default function CasesPage() {
  const [cases, setCases]     = useState<any[]>([])
  const [users, setUsers]     = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Record<string, string>>({})
  const user = useAuthStore(s => s.user)
  const { toast, showToast, hideToast } = useToast()

  const load = async () => {
    try {
      const [casesRes, usersRes] = await Promise.all([
        api.get('/cases'),
        api.get('/users'),
      ])
      setCases(casesRes.data)
      setUsers(usersRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleTransfer = async (caseId: string, newHolderId: string) => {
    try {
      await api.patch(`/cases/${caseId}/holder`, { userId: newHolderId })
      await load()
    } catch (e: any) {       showToast(e.response?.data?.message, 'error')
 }
  }

  const handleRename = async (caseId: string) => {
    const label = editing[caseId]?.trim()
    if (!label) return
    try {
      await api.patch(`/cases/${caseId}/label`, { label })
      setEditing(e => { const n = { ...e }; delete n[caseId]; return n })
      await load()
    } catch (e: any) {       showToast(e.response?.data?.message, 'error')
 }
  }

if (loading) return <Spinner />
  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h1 style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1rem' }}>
        🎲 Poker Kits
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {cases.map((c: any) => (
          <div key={c.id} className="card">

            {/* Label row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              {editing[c.id] !== undefined ? (
                <>
                  <input
                    autoFocus
                    value={editing[c.id]}
                    onChange={e => setEditing(ed => ({ ...ed, [c.id]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') handleRename(c.id); if (e.key === 'Escape') setEditing(ed => { const n = { ...ed }; delete n[c.id]; return n }) }}
                    style={{ flex: 1, background: '#1a1a2e', color: 'white', border: '1px solid #16a34a', borderRadius: '0.5rem', padding: '0.25rem 0.5rem' }}
                  />
                  <button onClick={() => handleRename(c.id)} style={{ color: '#16a34a', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Save</button>
                  <button onClick={() => setEditing(ed => { const n = { ...ed }; delete n[c.id]; return n })} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                </>
              ) : (
                <>
                  <span style={{ fontWeight: 600, color: 'white', flex: 1 }}>{c.label}</span>
                  <span style={{
                    fontSize: '0.75rem', padding: '2px 8px', borderRadius: 99,
                    background: c.type === 'PRIMARY' ? '#16a34a33' : '#37415133',
                    color: c.type === 'PRIMARY' ? '#16a34a' : '#9ca3af'
                  }}>{c.type}</span>
                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => setEditing(ed => ({ ...ed, [c.id]: c.label }))}
                      style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                    >✏️</button>
                  )}
                </>
              )}
            </div>

            {/* Holder */}
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: user?.role === 'ADMIN' ? 8 : 0 }}>
              📍 Currently with: <span style={{ color: 'white', fontWeight: 500 }}>{c.heldBy?.nickname}</span>
            </p>

            {/* Transfer — admin only */}
            {user?.role === 'ADMIN' && (
              <div>
                <label style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>
                  Transfer to:
                </label>
                <select
                  value={c.heldByUserId}
                  onChange={e => handleTransfer(c.id, e.target.value)}
                  style={{
                    width: '100%', background: '#1a1a2e', color: 'white',
                    border: '1px solid #4b5563', borderRadius: '0.5rem',
                    padding: '0.375rem 0.75rem', cursor: 'pointer'
                  }}
                >
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.nickname}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

    </div>
  )
}