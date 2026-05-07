import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Spinner from '../components/ui/Spinner'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'
import { useAuthStore } from '../store/auth.store'




const GAMES: Record<string, string> = {
  TEXAS_HOLDEM:     'Texas Hold\'em',
  OMAHA:            'Omaha',
  PINEAPPLE:        'Pineapple',
  TEXAS_LAKRAN:     'Texas Lakran',
  OMAHA_LAKRAN:     'Omaha Lakran',
  PREFERRED_2_CARDS:'Preferred 2 Cards',
}

const DAYS: Record<string, string> = {
  SUN: 'Sun', MON: 'Mon', TUE: 'Tue', WED: 'Wed',
  THU: 'Thu', FRI: 'Fri', SAT: 'Sat',
}

export default function PlayersPage() {
  const [players, setPlayers]           = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [expanded, setExpanded]         = useState<string | null>(null)
  const [pwTarget, setPwTarget]         = useState<string | null>(null)
  const [newPassword, setNewPassword]   = useState('')
  const [pwSaving, setPwSaving]         = useState(false)
  const { toast, hideToast } = useToast()
  const navigate = useNavigate()
  const activeGang = useAuthStore(s => s.activeGang)

  const load = async () => {
    const { data } = await api.get('/users?includeInactive=true')
    setPlayers(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [activeGang?.id])

  const toggleActive = async (id: string, isActive: boolean) => {
    await api.patch(`/users/${id}/status`, { isActive: !isActive })
    await load()
  }

  const handleSetPassword = async (id: string) => {
    if (!newPassword || newPassword.length < 6) return alert('Password must be at least 6 characters')
    setPwSaving(true)
    try {
      await api.patch(`/users/${id}/password`, { password: newPassword })
      setPwTarget(null)
      setNewPassword('')
      alert('Password updated')
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error setting password')
    } finally {
      setPwSaving(false)
    }
  }

if (loading) return <Spinner />
  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
  <h1 style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.25rem' }}>👥 Players</h1>
  <button
    onClick={() => navigate('/admin/players/new')}
    style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer', fontWeight: 600 }}
  >+ Add</button>
</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {players.map((p: any) => (
          <div key={p.id} className="card" style={{ opacity: p.isActive ? 1 : 0.5 }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#16a34a33',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#16a34a', fontWeight: 700, fontSize: '0.875rem'
                }}>
                  {p.nickname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ color: 'white', fontWeight: 600 }}>{p.nickname}</p>
                  <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{p.fullName}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99,
                  background: p.role === 'ADMIN' ? '#16a34a33' : '#37415133',
                  color: p.role === 'ADMIN' ? '#16a34a' : '#9ca3af'
                }}>{p.role}</span>
                <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>{expanded === p.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {expanded === p.id && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #1f2937' }}>
                <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: 4 }}>📞 {p.phone}</p>

                {p.favoriteGames?.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: 4 }}>Favorite Games</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {p.favoriteGames.map((g: string) => (
                        <span key={g} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99, background: '#16a34a22', color: '#16a34a', border: '1px solid #16a34a44' }}>
                          {GAMES[g] ?? g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {p.preferredDays?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: 4 }}>Preferred Days</p>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {p.preferredDays.map((d: string) => (
                        <span key={d} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99, background: '#37415133', color: '#9ca3af', border: '1px solid #4b5563' }}>
                          {DAYS[d] ?? d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Set Password (admin only) */}
                {pwTarget === p.id ? (
                  <div style={{ marginBottom: 8, display: 'flex', gap: 6 }}>
                    <input
                      type="password"
                      placeholder="New password (min 6 chars)"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      style={{ flex: 1, background: '#1a1a2e', color: 'white', border: '1px solid #4b5563', borderRadius: '0.5rem', padding: '0.375rem 0.5rem', fontSize: '0.875rem' }}
                    />
                    <button
                      onClick={() => handleSetPassword(p.id)}
                      disabled={pwSaving}
                      style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: '#16a34a', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
                    >{pwSaving ? '...' : 'Save'}</button>
                    <button
                      onClick={() => { setPwTarget(null); setNewPassword('') }}
                      style={{ padding: '0.375rem 0.5rem', borderRadius: '0.5rem', background: 'transparent', color: '#9ca3af', border: '1px solid #4b5563', cursor: 'pointer', fontSize: '0.875rem' }}
                    >✕</button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setPwTarget(p.id); setNewPassword('') }}
                    style={{ width: '100%', padding: '0.375rem', borderRadius: '0.5rem', background: '#1e3a5f33', color: '#60a5fa', border: '1px solid #1e3a5f', cursor: 'pointer', fontSize: '0.875rem', marginBottom: 6 }}
                  >🔑 Set Password</button>
                )}

                <button
                  onClick={() => toggleActive(p.id, p.isActive)}
                  style={{
                    width: '100%', padding: '0.375rem', borderRadius: '0.5rem',
                    background: p.isActive ? '#7f1d1d33' : '#16a34a33',
                    color: p.isActive ? '#ef4444' : '#16a34a',
                    border: `1px solid ${p.isActive ? '#7f1d1d' : '#16a34a'}`,
                    cursor: 'pointer', fontSize: '0.875rem'
                  }}
                >
                  {p.isActive ? '🔴 Deactivate Player' : '🟢 Activate Player'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

    </div>
  )
}