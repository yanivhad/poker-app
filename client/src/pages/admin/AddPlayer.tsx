import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function AddPlayerPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    nickname: '',
    phone:    '',
    password: '',
    role:     'PLAYER',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.fullName || !form.nickname || !form.phone)
      return alert('Full name, nickname and phone are required')
    setSaving(true)
    try {
      await api.post('/users', form)
      navigate('/players')
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error creating player')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h1 style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1rem' }}>
        ➕ Add Player
      </h1>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        <div>
          <label style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Full Name</label>
          <input
            value={form.fullName}
            onChange={e => set('fullName', e.target.value)}
            placeholder="Yossi Cohen"
            style={{ width: '100%', background: '#1a1a2e', color: 'white', border: '1px solid #4b5563', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}
          />
        </div>

        <div>
          <label style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Nickname</label>
          <input
            value={form.nickname}
            onChange={e => set('nickname', e.target.value)}
            placeholder="Yossi"
            style={{ width: '100%', background: '#1a1a2e', color: 'white', border: '1px solid #4b5563', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}
          />
        </div>

        <div>
          <label style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Phone</label>
          <input
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            placeholder="+972501234567"
            type="tel"
            style={{ width: '100%', background: '#1a1a2e', color: 'white', border: '1px solid #4b5563', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}
          />
        </div>

        <div>
          <label style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Password <span style={{ color: '#6b7280' }}>(optional — can be set later)</span></label>
          <input
            value={form.password}
            onChange={e => set('password', e.target.value)}
            placeholder="Min 6 characters"
            type="password"
            style={{ width: '100%', background: '#1a1a2e', color: 'white', border: '1px solid #4b5563', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}
          />
        </div>

        <div>
          <label style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Role</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['PLAYER', 'ADMIN'].map(r => (
              <button key={r}
                onClick={() => set('role', r)}
                style={{
                  flex: 1, padding: '0.5rem', borderRadius: '0.5rem',
                  fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                  border: `1px solid ${form.role === r ? '#16a34a' : '#4b5563'}`,
                  background: form.role === r ? '#16a34a' : 'transparent',
                  color: form.role === r ? 'white' : '#9ca3af',
                }}
              >{r}</button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            width: '100%', padding: '0.625rem', borderRadius: '0.5rem',
            background: '#16a34a', color: 'white', fontWeight: 600,
            fontSize: '1rem', cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1, border: 'none',
          }}
        >
          {saving ? 'Adding...' : 'Add Player'}
        </button>
      </div>
    </div>
  )
}