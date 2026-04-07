export default function AboutPage() {
  const section: React.CSSProperties = { marginBottom: '2rem' }
  const h2: React.CSSProperties = { color: '#16a34a', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }
  const h3: React.CSSProperties = { color: 'white', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem', marginTop: '0.75rem' }
  const p: React.CSSProperties = { color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '0.4rem' }
  const li: React.CSSProperties = { color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '0.25rem' }
  const badge: React.CSSProperties = { display: 'inline-block', background: '#1f2937', border: '1px solid #374151', borderRadius: '0.375rem', padding: '0.15rem 0.6rem', fontSize: '0.75rem', color: '#d1d5db', marginRight: '0.4rem', marginBottom: '0.4rem' }
  const pill: React.CSSProperties = { display: 'inline-block', background: '#16a34a22', border: '1px solid #16a34a44', borderRadius: '9999px', padding: '0.15rem 0.6rem', fontSize: '0.75rem', color: '#16a34a', marginRight: '0.4rem', marginBottom: '0.4rem' }
  const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #1f2937' }
  const label: React.CSSProperties = { color: '#9ca3af', fontSize: '0.8rem' }
  const value: React.CSSProperties = { color: '#d1d5db', fontSize: '0.8rem', fontWeight: 500 }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      {/* Hero */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '2rem 1.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🃏</div>
        <h1 style={{ color: '#16a34a', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.25rem' }}>Poker App</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Private group poker management platform</p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={pill}>v1.0</span>
          <span style={pill}>Admin-managed</span>
          <span style={pill}>Private group</span>
        </div>
      </div>

      {/* Overview */}
      <div className="card" style={section}>
        <div style={h2}>Overview</div>
        <p style={p}>
          A closed-circle poker event platform for a fixed group of players. The admin manages events and players;
          members register, track results, settle debts, and follow the leaderboard — all in one place.
        </p>
      </div>

      {/* Roles */}
      <div className="card" style={section}>
        <div style={h2}>User Roles</div>
        <div style={row}>
          <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.875rem' }}>🛡 Admin</span>
          <span style={{ ...value, maxWidth: '65%', textAlign: 'right' }}>Create events, manage players, enter results, set passwords</span>
        </div>
        <div style={{ ...row, borderBottom: 'none' }}>
          <span style={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.875rem' }}>🎮 Player</span>
          <span style={{ ...value, maxWidth: '65%', textAlign: 'right' }}>Register for events, view results, settle debts, view stats</span>
        </div>
        <p style={{ ...p, marginTop: '0.75rem', fontSize: '0.8rem' }}>No public signup — accounts are created by admin only.</p>
      </div>

      {/* Features */}
      <div className="card" style={section}>
        <div style={h2}>Features</div>

        <div style={h3}>🗓 Event Management</div>
        <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
          <li style={li}>Create Ordinary (capped seats) or Special (unlimited) events</li>
          <li style={li}>In-Person or Online format (with link + password)</li>
          <li style={li}>Status flow: Draft → Open → Closed → Done (or Cancelled)</li>
          <li style={li}>Max 2 active events; events must be 3+ hours apart</li>
        </ul>

        <div style={h3}>📋 Registration & Waitlist</div>
        <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
          <li style={li}>Auto-confirmed when seats available, otherwise auto-waitlisted</li>
          <li style={li}>Cancellation triggers FIFO waitlist promotion</li>
          <li style={li}>Confirmed players can volunteer as the event host</li>
        </ul>

        <div style={h3}>💰 Results & Chip Accounting</div>
        <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
          <li style={li}>1 buy-in = 500 chips = 50 ₪</li>
          <li style={li}>Net = (finalChips − buyIns × 500) / 10</li>
          <li style={li}>Entry validates that all chips balance before submit</li>
          <li style={li}>Supports registered members, unregistered members, and guests</li>
        </ul>

        <div style={h3}>🤝 Settlements</div>
        <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
          <li style={li}>Greedy algorithm minimises number of transactions</li>
          <li style={li}>Status: Pending → Sent → Confirmed</li>
          <li style={li}>Pay directly via Bit deep-link from the app</li>
          <li style={li}>Guest settlements flagged for manual handling</li>
        </ul>

        <div style={h3}>📊 Leaderboard</div>
        <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
          <li style={li}>Total net ₪, games played, win count, win rate %</li>
          <li style={li}>Ranked with medals for top 3 — your row highlighted</li>
        </ul>

        <div style={h3}>🎲 Poker Cases</div>
        <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
          <li style={li}>Track physical chip cases and who holds them</li>
          <li style={li}>Admin can transfer custody or rename cases</li>
        </ul>

        <div style={h3}>✅ Event Checklist</div>
        <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
          <li style={li}>Per-event checklist for in-person events (Beers, Snacks, Heater…)</li>
          <li style={li}>Host manages items; all players can tick them off</li>
        </ul>
      </div>

      {/* Integrations */}
      <div className="card" style={section}>
        <div style={h2}>Integrations</div>
        <div style={row}>
          <span style={{ color: '#25D366', fontWeight: 600, fontSize: '0.875rem' }}>💬 WhatsApp</span>
          <span style={{ ...value, maxWidth: '60%', textAlign: 'right' }}>Share event announcements, results &amp; settlement summaries</span>
        </div>
        <div style={{ ...row, borderBottom: 'none' }}>
          <span style={{ color: '#0052cc', fontWeight: 600, fontSize: '0.875rem' }}>💳 Bit</span>
          <span style={{ ...value, maxWidth: '60%', textAlign: 'right' }}>One-tap deep-link to pay settlements</span>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="card" style={{ ...section, marginBottom: '0.5rem' }}>
        <div style={h2}>Tech Stack</div>
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ ...label, marginBottom: '0.4rem' }}>Frontend</div>
          {['React 19', 'TypeScript', 'Vite', 'Zustand', 'React Router', 'Tailwind'].map(t => <span key={t} style={badge}>{t}</span>)}
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ ...label, marginBottom: '0.4rem' }}>Backend</div>
          {['Node.js', 'Express', 'TypeScript', 'Prisma', 'JWT', 'bcrypt'].map(t => <span key={t} style={badge}>{t}</span>)}
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ ...label, marginBottom: '0.4rem' }}>Database</div>
          {['PostgreSQL', 'Railway'].map(t => <span key={t} style={badge}>{t}</span>)}
        </div>
        <div>
          <div style={{ ...label, marginBottom: '0.4rem' }}>Deployment</div>
          {['Vercel (client)', 'Railway (server)'].map(t => <span key={t} style={badge}>{t}</span>)}
        </div>
      </div>
    </div>
  )
}
