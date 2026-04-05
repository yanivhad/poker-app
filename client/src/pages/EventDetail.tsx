import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { shareResults } from '../utils/whatsapp'
import Spinner from '../components/ui/Spinner'

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent]             = useState<any>(null)
  const [results, setResults]         = useState<any[]>([])
  const [settlements, setSettlements] = useState<any[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/events/${id}`),
      api.get(`/events/${id}/results`),
      api.get(`/events/${id}/settlements`),
    ]).then(([evtRes, resultsRes, settlementsRes]) => {
      setEvent(evtRes.data)
      setResults(resultsRes.data.sort((a: any, b: any) => b.netNIS - a.netNIS))
      setSettlements(settlementsRes.data)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner />
  if (!event)  return <div style={{ color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>Event not found</div>

  const date     = new Date(event.date)
  const totalPot = results.reduce((sum: number, r: any) => sum + (r.buyIn?.count ?? 1) * 50, 0)

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate('/history')}
          style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1.25rem' }}
        >
          ←
        </button>
        <h1 style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.25rem' }}>Event Detail</h1>
      </div>

      {/* Event info */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p style={{ fontWeight: 600, fontSize: '1.125rem', color: 'white' }}>
          {event.format === 'ONLINE' ? '💻 Online' : '🏠 In Person'}
          {' · '}
          {event.type === 'SPECIAL' ? '🏆 Special' : 'Ordinary'}
        </p>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
          {date.toLocaleDateString('en-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          {' at '}
          {date.toLocaleTimeString('en-IL', { hour: '2-digit', minute: '2-digit' })}
        </p>
        {event.host && (
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
            🏠 Host: <span style={{ color: 'white', fontWeight: 500 }}>{event.host.nickname}</span>
          </p>
        )}
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
          💰 Total pot: <span style={{ color: 'white', fontWeight: 600 }}>{totalPot}₪</span>
        </p>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontWeight: 600, color: 'white' }}>Results</h2>
            <a
              href={shareResults(event, results)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#25D366', color: 'white',
                padding: '0.25rem 0.75rem', borderRadius: '0.5rem',
                fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none',
              }}
            >
              📤 Share
            </a>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f172a' }}>
                <th style={{ padding: '0.5rem 1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem' }}>#</th>
                <th style={{ padding: '0.5rem 1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem' }}>PLAYER</th>
                <th style={{ padding: '0.5rem 1rem', textAlign: 'right', color: '#9ca3af', fontSize: '0.75rem' }}>BUY-INS</th>
                <th style={{ padding: '0.5rem 1rem', textAlign: 'right', color: '#9ca3af', fontSize: '0.75rem' }}>CHIPS</th>
                <th style={{ padding: '0.5rem 1rem', textAlign: 'right', color: '#9ca3af', fontSize: '0.75rem' }}>NET</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r: any, i: number) => {
                const name   = r.user?.nickname ?? r.guest?.name ?? 'Guest'
                const buyIns = r.buyIn?.count ?? 1
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: '0.625rem 1rem', color: '#6b7280' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </td>
                    <td style={{ padding: '0.625rem 1rem', color: 'white', fontWeight: 500 }}>{name}</td>
                    <td style={{ padding: '0.625rem 1rem', textAlign: 'right', color: '#9ca3af' }}>{buyIns}×</td>
                    <td style={{ padding: '0.625rem 1rem', textAlign: 'right', color: '#9ca3af' }}>{r.finalChips}</td>
                    <td style={{ padding: '0.625rem 1rem', textAlign: 'right', fontWeight: 700, color: r.netNIS >= 0 ? '#16a34a' : '#ef4444' }}>
                      {r.netNIS >= 0 ? '+' : ''}{r.netNIS.toFixed(0)}₪
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Settlement summary */}
      {settlements.length > 0 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h2 style={{ fontWeight: 600, color: 'white', marginBottom: 4 }}>💸 Settlement</h2>
          {settlements.map((s: any) => {
            const fromName = s.fromUser?.nickname ?? s.fromGuestName ?? 'Guest'
            const toName   = s.toUser?.nickname   ?? s.toGuestName   ?? 'Guest'
            return (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #1f2937' }}>
                <div style={{ fontSize: '0.875rem' }}>
                  <span style={{ color: '#ef4444', fontWeight: 500 }}>{fromName}</span>
                  <span style={{ color: '#9ca3af', margin: '0 6px' }}>→</span>
                  <span style={{ color: '#16a34a', fontWeight: 500 }}>{toName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'white', fontWeight: 700 }}>{s.amountNIS}₪</span>
                  <span style={{ fontSize: '0.75rem', color: s.status === 'PENDING' ? '#f59e0b' : '#16a34a' }}>
                    {s.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button
        onClick={() => navigate(`/events/${id}/settlement`)}
        style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', background: '#374151', color: 'white', border: '1px solid #4b5563', cursor: 'pointer' }}
      >
        💸 Go to Settlement
      </button>

    </div>
  )
}