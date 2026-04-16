import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import { getGangMembers, updateGangMember, removeGangMember } from '../api/gangs.api'
import Spinner from '../components/ui/Spinner'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'

const STATUS_LABEL: Record<string, string> = {
  APPROVED: '✅ Approved',
  PENDING:  '⏳ Pending',
  REJECTED: '❌ Rejected',
}

export default function GangDetailPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const user       = useAuthStore(s => s.user)
  const activeGang = useAuthStore(s => s.activeGang)
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast, showToast, hideToast } = useToast()

  const isMaster   = user?.role === 'MASTER' || user?.role === 'ADMIN'
  const isGangAdmin = activeGang?.role === 'ADMIN' || isMaster

  const load = async () => {
    try {
      const data = await getGangMembers(id!)
      setMembers(data)
    } catch {
      showToast('Failed to load members', 'error')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const handleApprove = async (userId: string) => {
    try {
      await updateGangMember(id!, userId, { status: 'APPROVED' })
      await load()
      showToast('Member approved!')
    } catch (e: any) { showToast(e.response?.data?.message || 'Failed', 'error') }
  }

  const handleReject = async (userId: string) => {
    try {
      await updateGangMember(id!, userId, { status: 'REJECTED' })
      await load()
      showToast('Request rejected')
    } catch (e: any) { showToast(e.response?.data?.message || 'Failed', 'error') }
  }

  const handleSetRole = async (userId: string, role: 'ADMIN' | 'MEMBER') => {
    try {
      await updateGangMember(id!, userId, { role })
      await load()
      showToast(`Role updated to ${role}`)
    } catch (e: any) { showToast(e.response?.data?.message || 'Failed', 'error') }
  }

  const handleRemove = async (userId: string, nickname: string) => {
    if (!confirm(`Remove ${nickname} from this gang?`)) return
    try {
      await removeGangMember(id!, userId)
      await load()
      showToast('Member removed')
    } catch (e: any) { showToast(e.response?.data?.message || 'Failed', 'error') }
  }

  if (loading) return <Spinner />

  const approved = members.filter(m => m.status === 'APPROVED')
  const pending  = members.filter(m => m.status === 'PENDING')
  const rejected = members.filter(m => m.status === 'REJECTED')

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
        <button onClick={() => navigate('/gangs')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1.25rem' }}>←</button>
        <h1 style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.25rem' }}>🏴 Gang Members</h1>
      </div>

      {/* Pending requests — gang admin only */}
      {isGangAdmin && pending.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
            📬 Pending Requests ({pending.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {pending.map(m => (
              <div key={m.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid #f59e0b' }}>
                <div>
                  <p style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>{m.user.nickname}</p>
                  <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>{m.user.fullName}</p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => handleApprove(m.user.id)}
                    style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                  >✓ Approve</button>
                  <button
                    onClick={() => handleReject(m.user.id)}
                    style={{ background: '#7f1d1d33', color: '#ef4444', border: '1px solid #7f1d1d', borderRadius: '0.5rem', padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}
                  >✕ Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved members */}
      <div>
        <p style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
          Members ({approved.length})
        </p>
        {approved.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>No members yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {approved.map(m => {
              const isSelf = m.user.id === user?.id
              return (
                <div key={m.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: isSelf ? '#16a34a' : 'white', fontWeight: 600, fontSize: '0.875rem' }}>
                      {m.user.nickname} {isSelf && '(you)'}
                    </p>
                    <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>{m.user.fullName}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99,
                      background: m.role === 'ADMIN' ? '#16a34a22' : '#37415133',
                      color: m.role === 'ADMIN' ? '#16a34a' : '#9ca3af',
                      border: `1px solid ${m.role === 'ADMIN' ? '#16a34a44' : '#374151'}`,
                    }}>
                      {m.role}
                    </span>
                    {isGangAdmin && !isSelf && (
                      <>
                        <button
                          onClick={() => handleSetRole(m.user.id, m.role === 'ADMIN' ? 'MEMBER' : 'ADMIN')}
                          style={{ background: '#374151', color: '#d1d5db', border: '1px solid #4b5563', borderRadius: '0.375rem', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}
                        >{m.role === 'ADMIN' ? 'Demote' : 'Make Admin'}</button>
                        <button
                          onClick={() => handleRemove(m.user.id, m.user.nickname)}
                          style={{ background: 'none', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                        >✕</button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Rejected — gang admin only */}
      {isGangAdmin && rejected.length > 0 && (
        <div style={{ marginTop: '1.25rem' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
            Rejected ({rejected.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {rejected.map(m => (
              <div key={m.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }}>
                <p style={{ color: 'white', fontSize: '0.875rem' }}>{m.user.nickname}</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => handleApprove(m.user.id)}
                    style={{ background: '#374151', color: '#16a34a', border: '1px solid #16a34a', borderRadius: '0.5rem', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}
                  >Approve</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
