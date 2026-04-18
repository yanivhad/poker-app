import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'

export default function AppShell() {
  const logout       = useAuthStore(s => s.logout)
  const user         = useAuthStore(s => s.user)
  const gangs        = useAuthStore(s => s.gangs)
  const activeGang   = useAuthStore(s => s.activeGang)
  const setActiveGang = useAuthStore(s => s.setActiveGang)
  const navigate     = useNavigate()

  const isMaster = user?.role === 'MASTER' || user?.role === 'ADMIN'
  const isGangAdmin = activeGang?.role === 'ADMIN' || isMaster

  const navItems = [
    { to: '/',        label: '🏠 Home'    },
    { to: '/stats',   label: '📊 Stats'   },
    { to: '/history', label: '📅 History' },
    { to: '/players', label: '👥 Players' },
    { to: '/cases',   label: '🎲 Kits'    },
    { to: '/gangs',   label: '🏴 Gang'    },
    { to: '/profile', label: '👤 Profile' },
    { to: '/about',   label: 'ℹ️ About'   },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ background: '#16213e', borderBottom: '1px solid #374151', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.125rem' }}>🃏 Poker App</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Gang switcher */}
          {gangs.length > 1 ? (
            <select
              value={activeGang?.id ?? ''}
              onChange={e => setActiveGang(e.target.value)}
              style={{
                background: '#1f2937', color: '#d1d5db', border: '1px solid #374151',
                borderRadius: '0.375rem', padding: '0.2rem 0.5rem', fontSize: '0.8rem', cursor: 'pointer',
              }}
            >
              {gangs.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          ) : activeGang ? (
            <span
              onClick={() => navigate('/gangs')}
              style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', background: '#16a34a22', border: '1px solid #16a34a44', borderRadius: '0.375rem', padding: '0.2rem 0.6rem' }}
            >
              🏴 {activeGang.name}
            </span>
          ) : (
            <span
              onClick={() => navigate('/gangs')}
              style={{ color: '#f59e0b', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              ⚠️ No gang
            </span>
          )}

          <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{user?.nickname}</span>
          <button onClick={logout} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>Logout</button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '1rem', paddingBottom: '5rem' }}>
        <Outlet />
      </main>

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#16213e', borderTop: '1px solid #374151', display: 'flex', justifyContent: 'space-around', padding: '0.5rem 0' }}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: '0.75rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '0.5rem',
              color: isActive ? '#16a34a' : '#9ca3af',
              textDecoration: 'none',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
