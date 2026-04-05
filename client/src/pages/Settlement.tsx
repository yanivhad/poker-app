import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuthStore } from '../store/auth.store'
import { shareSettlement } from '../utils/whatsapp'
import Spinner from '../components/ui/Spinner'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'

export default function SettlementPage() {
  const { id } = useParams()
  const user = useAuthStore(s => s.user)
  const [settlements, setSettlements] = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const { toast, showToast, hideToast } = useToast()

  useEffect(() => {
    api.get(`/events/${id}/settlements`)
      .then(r => setSettlements(r.data))
      .catch(() => showToast('Failed to load settlements', 'error'))
      .finally(() => setLoading(false))
  }, [id])

  const markSent = async (settlementId: string) => {
    try {
      await api.patch(`/settlements/${settlementId}`, { status: 'SENT' })
      setSettlements(s => s.map(x => x.id === settlementId ? { ...x, status: 'SENT' } : x))
      showToast('Marked as sent!')
    } catch {
      showToast('Failed to update', 'error')
    }
  }

  const openBit = (amount: number, toPhone: string) => {
    window.open(`https://www.bitpay.co.il/?amount=${amount}&phone=${toPhone}`, '_blank', 'noopener,noreferrer')
  }

  if (loading) return <Spinner />

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h1 style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1rem' }}>
        💸 Settlement
      </h1>

      {settlements.length > 0 && (
        <a
          href={shareSettlement(settlements)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block', textAlign: 'center', marginBottom: '1rem',
            background: '#25D366', color: 'white',
            padding: '0.5rem', borderRadius: '0.5rem',
            fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
          }}
        >
          📤 Share Settlement to WhatsApp
        </a>
      )}

      {settlements.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: '#9ca3af' }}>
          Everyone is even! No transfers needed 🎉
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {settlements.map((s: any) => {
            const fromName = s.fromUser?.nickname ?? s.fromGuestName ?? 'Guest'
            const toName   = s.toUser?.nickname   ?? s.toGuestName   ?? 'Guest'
            const isMe     = s.fromUser?.id === user?.id
            const toPhone  = s.toUser?.phone

            return (
              <div key={s.id} className="card" style={{ borderLeft: `3px solid ${isMe ? '#ef4444' : '#16a34a'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: isMe ? '#ef4444' : 'white' }}>{fromName}</span>
                    <span style={{ color: '#9ca3af', margin: '0 6px' }}>→</span>
                    <span style={{ fontWeight: 600, color: '#16a34a' }}>{toName}</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'white' }}>{s.amountNIS}₪</span>
                </div>

                {s.isGuestParty && (
                  <p style={{ color: '#f59e0b', fontSize: '0.75rem', marginTop: 4 }}>⚠️ Handle manually — guest involved</p>
                )}

                {isMe && s.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {toPhone && (
                      <button
                        onClick={() => openBit(s.amountNIS, toPhone)}
                        style={{ flex: 1, background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}
                      >💳 Pay with Bit</button>
                    )}
                    <button
                      onClick={() => markSent(s.id)}
                      style={{ flex: 1, background: '#374151', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}
                    >✅ Mark as Sent</button>
                  </div>
                )}

                {s.status !== 'PENDING' && (
                  <p style={{ color: '#16a34a', fontSize: '0.75rem', marginTop: 4 }}>✅ {s.status}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}