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
  const [confirming, setConfirming]   = useState<string | null>(null)
  const { toast, showToast, hideToast } = useToast()

  useEffect(() => {
    api.get(`/events/${id}/settlements`)
      .then(r => setSettlements(r.data))
      .catch(() => showToast('Failed to load settlements', 'error'))
      .finally(() => setLoading(false))
  }, [id])

  const markPaid = async (settlementId: string) => {
    try {
      const { data } = await api.patch(`/settlements/${settlementId}`, { status: 'SENT' })
      setSettlements(s => s.map(x => x.id === settlementId ? { ...x, status: data.status, reportPayAt: data.reportPayAt } : x))
      showToast('Payment reported!')
    } catch {
      showToast('Failed to update', 'error')
    } finally {
      setConfirming(null)
    }
  }

  const openBit = (amount: number, toPhone: string) => {
    window.open(`https://www.bitpay.co.il/?amount=${amount}&phone=${toPhone}`, '_blank', 'noopener,noreferrer')
  }

  if (loading) return <Spinner />

  const myOwed      = settlements.filter(s => s.fromUser?.id === user?.id)
  const otherOwed   = settlements.filter(s => s.fromUser?.id !== user?.id)

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* My payments */}
          {myOwed.length > 0 && (
            <div>
              <p style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>
                📬 You need to pay
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {myOwed.map((s: any) => {
                  const toName  = s.toUser?.nickname ?? s.toGuest?.name ?? s.toGuestName ?? 'Guest'
                  const toPhone = s.toUser?.phone ?? s.toGuest?.phone
                  const isPaid  = s.status !== 'PENDING'
                  const paidAt  = s.reportPayAt ? new Date(s.reportPayAt) : null

                  return (
                    <div key={s.id} className="card" style={{
                      borderLeft: `3px solid ${isPaid ? '#16a34a' : '#ef4444'}`,
                      opacity: isPaid ? 0.75 : 1,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.875rem' }}>
                          <span style={{ color: '#9ca3af' }}>To </span>
                          <span style={{ color: 'white', fontWeight: 600 }}>{toName}</span>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'white' }}>{s.amountNIS}₪</span>
                      </div>

                      {s.isGuestParty && (
                        <p style={{ color: '#f59e0b', fontSize: '0.75rem', marginTop: 4 }}>⚠️ Handle manually — guest involved</p>
                      )}

                      {isPaid ? (
                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: '#16a34a', fontSize: '0.875rem', fontWeight: 600 }}>✅ Paid</span>
                          {paidAt && (
                            <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                              · {paidAt.toLocaleDateString('en-IL', { day: 'numeric', month: 'short' })} at {paidAt.toLocaleTimeString('en-IL', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      ) : confirming === s.id ? (
                        <div style={{ marginTop: 8 }}>
                          <p style={{ color: '#fbbf24', fontSize: '0.875rem', marginBottom: 8 }}>
                            Confirm you've paid <strong>{toName}</strong> {s.amountNIS}₪?
                          </p>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => markPaid(s.id)}
                              style={{ flex: 1, background: '#16a34a', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
                            >Yes, I paid</button>
                            <button
                              onClick={() => setConfirming(null)}
                              style={{ flex: 1, background: '#374151', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}
                            >Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          {toPhone && (
                            <button
                              onClick={() => openBit(s.amountNIS, toPhone)}
                              style={{ flex: 1, background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}
                            >💳 Pay with Bit</button>
                          )}
                          <button
                            onClick={() => setConfirming(s.id)}
                            style={{ flex: 1, background: '#374151', color: 'white', border: '1px solid #4b5563', borderRadius: '0.5rem', padding: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}
                          >☑️ Mark as Paid</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Others' payments */}
          {otherOwed.length > 0 && (
            <div>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>
                📋 Other transfers
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {otherOwed.map((s: any) => {
                  const fromName = s.fromUser?.nickname ?? s.fromGuestName ?? 'Guest'
                  const toName   = s.toUser?.nickname   ?? s.toGuestName   ?? 'Guest'
                  const isPaid   = s.status !== 'PENDING'
                  const paidAt   = s.reportPayAt ? new Date(s.reportPayAt) : null

                  return (
                    <div key={s.id} className="card" style={{
                      borderLeft: `3px solid ${isPaid ? '#16a34a' : '#374151'}`,
                      opacity: isPaid ? 0.65 : 1,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.875rem' }}>
                          <span style={{ color: 'white', fontWeight: 600 }}>{fromName}</span>
                          <span style={{ color: '#9ca3af', margin: '0 6px' }}>→</span>
                          <span style={{ color: '#16a34a', fontWeight: 600 }}>{toName}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: 'white' }}>{s.amountNIS}₪</span>
                      </div>
                      {s.isGuestParty && (
                        <p style={{ color: '#f59e0b', fontSize: '0.75rem', marginTop: 4 }}>⚠️ Handle manually — guest involved</p>
                      )}
                      {isPaid && (
                        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: '#16a34a', fontSize: '0.75rem' }}>✅ Paid</span>
                          {paidAt && (
                            <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                              · {paidAt.toLocaleDateString('en-IL', { day: 'numeric', month: 'short' })} at {paidAt.toLocaleTimeString('en-IL', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
