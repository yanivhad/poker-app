import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuthStore } from '../store/auth.store'
import Spinner from '../components/ui/Spinner'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'

export default function StatsPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const user = useAuthStore(s => s.user)
const { toast, hideToast } = useToast()
  useEffect(() => {
    api.get('/stats/leaderboard')
      .then(r => setLeaderboard(r.data))
      .catch(() => setLeaderboard([]))
      .finally(() => setLoading(false))
  }, [])

if (loading) return <Spinner />
  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h1 style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1rem' }}>
        📊 Leaderboard
      </h1>

      {leaderboard.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: '#9ca3af' }}>
          <p>No results yet. Play some games first! 🃏</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f172a', borderBottom: '1px solid #374151' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem' }}>#</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.75rem' }}>PLAYER</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#9ca3af', fontSize: '0.75rem' }}>GAMES</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#9ca3af', fontSize: '0.75rem' }}>NET (₪)</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#9ca3af', fontSize: '0.75rem' }}>WIN %</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((p: any, i: number) => (
                <tr key={p.userId} style={{ borderBottom: '1px solid #1f2937', background: p.userId === user?.id ? '#16a34a11' : 'transparent' }}>
                  <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontWeight: 700 }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: p.userId === user?.id ? '#16a34a' : 'white', fontWeight: p.userId === user?.id ? 600 : 400 }}>
                    {p.nickname}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#9ca3af' }}>{p.gamesPlayed}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: p.netNIS >= 0 ? '#16a34a' : '#ef4444' }}>
                    {p.netNIS >= 0 ? '+' : ''}{p.netNIS.toFixed(0)}₪
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#9ca3af' }}>
                    {p.winRate.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

    </div>
  )
}