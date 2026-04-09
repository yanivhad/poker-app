import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getEventById, updateEvent } from '../../api/events.api'
import Spinner from '../../components/ui/Spinner'

const inputStyle = {
  color: 'white',
  background: '#1a1a2e',
  border: '1px solid #4b5563',
  borderRadius: '0.5rem',
  padding: '0.5rem 0.75rem',
  width: '100%',
  display: 'block',
  colorScheme: 'dark' as const,
}

const pad = (n: number) => String(n).padStart(2, '0')
const fmt = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`

export default function EditEventPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState<any>(null)

  useEffect(() => {
    getEventById(id!).then(event => {
      setForm({
        type:                event.type,
        format:              event.format,
        date:                fmt(new Date(event.date)),
        lastRoundTime:       event.lastRoundTime ? fmt(new Date(event.lastRoundTime)) : '',
        registrationOpensAt: fmt(new Date(event.registrationOpensAt)),
        maxSeats:            event.maxSeats,
        onlineLink:          event.onlineLink   ?? '',
        onlinePassword:      event.onlinePassword ?? '',
      })
    }).finally(() => setLoading(false))
  }, [id])

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.date || !form.registrationOpensAt)
      return alert('Date and registration open time are required')
    setSaving(true)
    try {
      const payload: any = {
        type:                form.type,
        format:              form.format,
        date:                new Date(form.date).toISOString(),
        registrationOpensAt: new Date(form.registrationOpensAt).toISOString(),
        maxSeats:            form.type === 'SPECIAL' ? 999 : Number(form.maxSeats),
      }
      if (form.lastRoundTime) payload.lastRoundTime = new Date(form.lastRoundTime).toISOString()
      if (form.format === 'ONLINE') {
        payload.onlineLink     = form.onlineLink     || null
        payload.onlinePassword = form.onlinePassword || null
      } else {
        payload.onlineLink     = null
        payload.onlinePassword = null
      }
      await updateEvent(id!, payload)
      navigate('/')
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update event')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />
  if (!form)   return null

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1.25rem' }}
        >←</button>
        <h1 style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.25rem' }}>Edit Event</h1>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Type */}
        <div>
          <label style={{ color: '#9ca3af', fontSize: '0.875rem', display: 'block', marginBottom: 4 }}>Event Type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ value: 'ORDINARY', label: '🃏 Ordinary' }, { value: 'SPECIAL', label: '🏆 Special' }].map(t => (
              <button key={t.value} onClick={() => set('type', t.value)}
                style={{
                  flex: 1, padding: '0.5rem', borderRadius: '0.5rem',
                  fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                  border: `1px solid ${form.type === t.value ? '#16a34a' : '#4b5563'}`,
                  background: form.type === t.value ? '#16a34a' : 'transparent',
                  color: form.type === t.value ? 'white' : '#9ca3af',
                }}
              >{t.label}</button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div>
          <label style={{ color: '#9ca3af', fontSize: '0.875rem', display: 'block', marginBottom: 4 }}>Format</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ value: 'IN_PERSON', label: '🏠 In Person' }, { value: 'ONLINE', label: '💻 Online' }].map(f => (
              <button key={f.value} onClick={() => set('format', f.value)}
                style={{
                  flex: 1, padding: '0.5rem', borderRadius: '0.5rem',
                  fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                  border: `1px solid ${form.format === f.value ? '#16a34a' : '#4b5563'}`,
                  background: form.format === f.value ? '#16a34a' : 'transparent',
                  color: form.format === f.value ? 'white' : '#9ca3af',
                }}
              >{f.label}</button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label style={{ color: '#9ca3af', fontSize: '0.875rem', display: 'block', marginBottom: 4 }}>Event Date & Start Time</label>
          <input type="datetime-local" value={form.date} style={inputStyle}
            onChange={e => set('date', e.target.value)} />
        </div>

        {/* Last round */}
        <div>
          <label style={{ color: '#9ca3af', fontSize: '0.875rem', display: 'block', marginBottom: 4 }}>Last Round Time</label>
          <input type="datetime-local" value={form.lastRoundTime} style={inputStyle}
            onChange={e => set('lastRoundTime', e.target.value)} />
        </div>

        {/* Registration opens */}
        <div>
          <label style={{ color: '#9ca3af', fontSize: '0.875rem', display: 'block', marginBottom: 4 }}>Registration Opens At</label>
          <input type="datetime-local" value={form.registrationOpensAt} style={inputStyle}
            onChange={e => set('registrationOpensAt', e.target.value)} />
        </div>

        {/* Max seats */}
        {form.type === 'ORDINARY' && (
          <div>
            <label style={{ color: '#9ca3af', fontSize: '0.875rem', display: 'block', marginBottom: 4 }}>Max Seats</label>
            <input type="number" min={1} max={20} value={form.maxSeats} style={inputStyle}
              onChange={e => set('maxSeats', e.target.value)} />
          </div>
        )}

        {/* Online fields */}
        {form.format === 'ONLINE' && (
          <>
            <div>
              <label style={{ color: '#9ca3af', fontSize: '0.875rem', display: 'block', marginBottom: 4 }}>Platform Link</label>
              <input type="url" placeholder="https://..." value={form.onlineLink} style={inputStyle}
                onChange={e => set('onlineLink', e.target.value)} />
            </div>
            <div>
              <label style={{ color: '#9ca3af', fontSize: '0.875rem', display: 'block', marginBottom: 4 }}>Room Password (optional)</label>
              <input type="text" value={form.onlinePassword} style={inputStyle}
                onChange={e => set('onlinePassword', e.target.value)} />
            </div>
          </>
        )}

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
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

      </div>
    </div>
  )
}
