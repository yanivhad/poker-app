import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/auth.store'
import api from '../api/axios'

const GAMES = [
  { value: 'TEXAS_HOLDEM',    label: 'Texas Hold\'em' },
  { value: 'OMAHA',           label: 'Omaha' },
  { value: 'PINEAPPLE',       label: 'Pineapple' },
  { value: 'TEXAS_LAKRAN',    label: 'Texas Lakran' },
  { value: 'OMAHA_LAKRAN',    label: 'Omaha Lakran' },
  { value: 'PREFERRED_2_CARDS', label: 'Preferred 2 Cards' },
]

const DAYS = [
  { value: 'SUN', label: 'Sun' },
  { value: 'MON', label: 'Mon' },
  { value: 'TUE', label: 'Tue' },
  { value: 'WED', label: 'Wed' },
  { value: 'THU', label: 'Thu' },
  { value: 'FRI', label: 'Fri' },
  { value: 'SAT', label: 'Sat' },
]

export default function ProfilePage() {
  const user = useAuthStore(s => s.user)
  const loadUser = useAuthStore(s => s.loadUser)
  const [profile, setProfile]   = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [editing, setEditing]   = useState(false)
  const [form, setForm]         = useState<any>(null)

  useEffect(() => {
    api.get('/users/me').then(r => {
      setProfile(r.data)
      setForm(r.data)
    }).finally(() => setLoading(false))
  }, [])

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v: string) => v !== val) : [...arr, val]

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.put(`/users/${user?.id}`, {
        fullName:      form.fullName,
        nickname:      form.nickname,
        favoriteGames: form.favoriteGames,
        preferredDays: form.preferredDays,
      })
      setProfile(data)
      setEditing(false)
      await loadUser()
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error saving profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>Loading...</div>

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.25rem' }}>👤 Profile</h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={{ background: '#374151', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer' }}
          >✏️ Edit</button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Full name */}
        <div>
          <label style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Full Name</label>
          {editing ? (
            <input
              value={form.fullName}
              onChange={e => setForm((f: any) => ({ ...f, fullName: e.target.value }))}
              style={{ width: '100%', background: '#1a1a2e', color: 'white', border: '1px solid #4b5563', borderRadius: '0.5rem', padding: '0.375rem 0.75rem' }}
            />
          ) : (
            <p style={{ color: 'white', fontWeight: 500 }}>{profile.fullName}</p>
          )}
        </div>

        {/* Nickname */}
        <div>
          <label style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Nickname</label>
          {editing ? (
            <input
              value={form.nickname}
              onChange={e => setForm((f: any) => ({ ...f, nickname: e.target.value }))}
              style={{ width: '100%', background: '#1a1a2e', color: 'white', border: '1px solid #4b5563', borderRadius: '0.5rem', padding: '0.375rem 0.75rem' }}
            />
          ) : (
            <p style={{ color: 'white', fontWeight: 500 }}>{profile.nickname}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Phone</label>
          <p style={{ color: '#6b7280' }}>{profile.phone}</p>
        </div>

        {/* Role */}
        <div>
          <label style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Role</label>
          <span style={{
            fontSize: '0.75rem', padding: '2px 10px', borderRadius: 99,
            background: profile.role === 'ADMIN' ? '#16a34a33' : '#37415133',
            color: profile.role === 'ADMIN' ? '#16a34a' : '#9ca3af'
          }}>{profile.role}</span>
        </div>

        {/* Favorite games */}
        <div>
          <label style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block', marginBottom: 8 }}>Favorite Games</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {GAMES.map(g => {
              const selected = (editing ? form : profile).favoriteGames?.includes(g.value)
              return (
                <button
                  key={g.value}
                  onClick={() => editing && setForm((f: any) => ({ ...f, favoriteGames: toggle(f.favoriteGames, g.value) }))}
                  style={{
                    padding: '4px 10px', borderRadius: 99, fontSize: '0.75rem',
                    cursor: editing ? 'pointer' : 'default',
                    border: `1px solid ${selected ? '#16a34a' : '#4b5563'}`,
                    background: selected ? '#16a34a22' : 'transparent',
                    color: selected ? '#16a34a' : '#9ca3af',
                  }}
                >{g.label}</button>
              )
            })}
          </div>
        </div>

        {/* Preferred days */}
        <div>
          <label style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block', marginBottom: 8 }}>Preferred Days</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {DAYS.map(d => {
              const selected = (editing ? form : profile).preferredDays?.includes(d.value)
              return (
                <button
                  key={d.value}
                  onClick={() => editing && setForm((f: any) => ({ ...f, preferredDays: toggle(f.preferredDays, d.value) }))}
                  style={{
                    flex: 1, padding: '6px 0', borderRadius: '0.5rem', fontSize: '0.75rem',
                    cursor: editing ? 'pointer' : 'default',
                    border: `1px solid ${selected ? '#16a34a' : '#4b5563'}`,
                    background: selected ? '#16a34a22' : 'transparent',
                    color: selected ? '#16a34a' : '#9ca3af',
                  }}
                >{d.label}</button>
              )
            })}
          </div>
        </div>

        {/* Save / Cancel */}
        {editing && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ flex: 1, padding: '0.5rem', borderRadius: '0.5rem', background: '#16a34a', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >{saving ? 'Saving...' : 'Save'}</button>
            <button
              onClick={() => { setForm(profile); setEditing(false) }}
              style={{ flex: 1, padding: '0.5rem', borderRadius: '0.5rem', background: '#374151', color: 'white', border: 'none', cursor: 'pointer' }}
            >Cancel</button>
          </div>
        )}
      </div>
    </div>
  )
}