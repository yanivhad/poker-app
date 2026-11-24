import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import SeasonBadge from '../components/ui/SeasonBadge'

export default function EventHistoryPage() {
  const [events, setEvents]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [season, setSeason]   = useState<string>('ALL')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/events')
      .then(r => setEvents(r.data.filter((e: any) => e.status === 'DONE')))
      .finally(() => setLoading(false))
  }, [])

  const seasons = Array.from(new Set(events.map((e: any) => e.season).filter(Boolean))).sort().reverse() as string[]
  const shown   = season === 'ALL' ? events : events.filter((e: any) => e.season === season)

  if (loading) return <div style={{ color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>Loading...</div>

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h1 style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1rem' }}>
        📅 Event History
      </h1>

      {seasons.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' }}>
          {['ALL', ...seasons].map(s => (
            <button key={s} onClick={() => setSeason(s)}
              style={{
                padding: '0.25rem 0.75rem', borderRadius: 99, fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
                border: `1px solid ${season === s ? '#16a34a' : '#4b5563'}`,
                background: season === s ? '#16a34a' : 'transparent',
                color: season === s ? 'white' : '#9ca3af',
              }}
            >{s === 'ALL' ? 'All seasons' : `Season ${s}`}</button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: '#9ca3af' }}>
          No completed events yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {shown.map((e: any) => {
            const date = new Date(e.date)
            return (
              <div
                key={e.id}
                className="card"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/events/${e.id}`)}           >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: 'white', fontWeight: 600 }}>
                      {e.format === 'ONLINE' ? '💻' : '🏠'} {e.type === 'SPECIAL' ? '🏆 Special' : 'Ordinary'}
                    </p>
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                      {date.toLocaleDateString('en-IL', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {e.season && <div style={{ marginTop: 2 }}><SeasonBadge season={e.season} /></div>}
                    {e.host && (
                      <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Host: {e.host.nickname}</p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                      {e.registrations?.length ?? 0} players
                    </p>
                    <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>View settlement →</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}