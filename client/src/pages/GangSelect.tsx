import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

export default function GangSelectPage() {
  const gangs        = useAuthStore(s => s.gangs)
  const setActiveGang = useAuthStore(s => s.setActiveGang)
  const navigate     = useNavigate()

  const handleSelect = (gangId: string) => {
    setActiveGang(gangId)
    navigate('/')
  }

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: '0 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏴</div>
        <h1 style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.5rem' }}>Choose your gang</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: 4 }}>Select which gang to play in</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {gangs.map(g => (
          <button
            key={g.id}
            onClick={() => handleSelect(g.id)}
            style={{
              background: '#16213e', border: '1px solid #374151', borderRadius: '0.75rem',
              padding: '1rem', textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#16a34a')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#374151')}
          >
            <p style={{ color: 'white', fontWeight: 600, fontSize: '1rem', marginBottom: 2 }}>{g.name}</p>
            <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
              {g.role === 'ADMIN' ? '🛡 Gang Admin' : '🎮 Member'}
            </p>
          </button>
        ))}
      </div>

      <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <span
          onClick={() => navigate('/gangs')}
          style={{ color: '#4b5563', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Browse all gangs
        </span>
      </p>
    </div>
  )
}
