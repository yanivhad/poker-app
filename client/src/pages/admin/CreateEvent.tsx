import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createEvent } from '../../api/events.api'

function getDefaults() {
  const now = new Date()
  const date = new Date(now)
  date.setDate(date.getDate() + ((4 - date.getDay() + 7) % 7 || 7))
  date.setHours(21, 30, 0, 0)
  const lastRound = new Date(date)
  lastRound.setDate(lastRound.getDate() + 1)
  lastRound.setHours(1, 0, 0, 0)
  const regOpens = new Date(date)
  regOpens.setHours(regOpens.getHours() - 48)
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  return {
    date:                fmt(date),
    lastRoundTime:       fmt(lastRound),
    registrationOpensAt: fmt(regOpens),
  }
}

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

export default function CreateEventPage() {
  const navigate  = useNavigate()
  const [loading, setLoading] = useState(false)
  const defaults  = getDefaults()
  const [form, setForm] = useState({
    type:                'ORDINARY',
    format:              'IN_PERSON',
    date:                defaults.date,
    lastRoundTime:       defaults.lastRoundTime,
    registrationOpensAt: defaults.registrationOpensAt,
    maxSeats:            9,
    onlineLink:          '',
    onlinePassword:      '',
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleDateChange = (val: string) => {
    const pad = (n: number) => String(n).padStart(2, '0')
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    const date = new Date(val)
    const lastRound = new Date(date)
    lastRound.setDate(lastRound.getDate() + 1)
    lastRound.setHours(1, 0, 0, 0)
    const regOpens = new Date(date)
    regOpens.setHours(regOpens.getHours() - 48)
    setForm(f => ({
      ...f,
      date:                val,
      lastRoundTime:       fmt(lastRound),
      registrationOpensAt: fmt(regOpens),
    }))
  }

  const handleSubmit = async () => {
    if (!form.date || !form.registrationOpensAt)
      return alert('Date and registration open time are required')
    setLoading(true)
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
        if (form.onlineLink)     payload.onlineLink     = form.onlineLink
        if (form.onlinePassword) payload.onlinePassword = form.onlinePassword
      }
      await createEvent(payload)
      navigate('/')
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h1 style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1rem' }}>
        Create Event
      </h1>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Type */}
        <div>
          <label style={{ color: '#9ca3af', fontSize: '0.875rem', display: 'block', marginBottom: 4 }}>
            Event Type
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { value: 'ORDINARY', label: '🃏 Ordinary' },
              { value: 'SPECIAL',  label: '🏆 Special'  },
            ].map(t => (
              <button key={t.value}
                onClick={() => set('type', t.value)}
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
          <label style={{ color: '#9ca3af', fontSize: '0.875rem', display: 'block', marginBottom: 4 }}>
            Format
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { value: 'IN_PERSON', label: '🏠 In Person' },
              { value: 'ONLINE',    label: '💻 Online'    },
            ].map(f => (
              <button key={f.value}
                onClick={() => set('format', f.value)}
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
          <label style={{ color: '#9ca3af', fontSize: '0.875rem', display: 'block', marginBottom: 4 }}>
            Event Date & Start Time
          </label>
          <input type="datetime-local" value={form.date} style={inputStyle}
            onChange={e => handleDateChange(e.target.value)} />
        </div>

        {/* Last round */}
        <div>
          <label style={{ color: '#9ca3af', fontSize: '0.875rem', display: 'block', marginBottom: 4 }}>
            Last Round Time
          </label>
          <input type="datetime-local" value={form.lastRoundTime} style={inputStyle}
            onChange={e => set('lastRoundTime', e.target.value)} />
        </div>

        {/* Registration opens */}
        <div>
          <label style={{ color: '#9ca3af', fontSize: '0.875rem', display: 'block', marginBottom: 4 }}>
            Registration Opens At
          </label>
          <input type="datetime-local" value={form.registrationOpensAt} style={inputStyle}
            onChange={e => set('registrationOpensAt', e.target.value)} />
        </div>

        {/* Max seats */}
        {form.type === 'ORDINARY' && (
          <div>
            <label style={{ color: '#9ca3af', fontSize: '0.875rem', display: 'block', marginBottom: 4 }}>
              Max Seats
            </label>
            <input type="number" min={1} max={20} value={form.maxSeats} style={inputStyle}
              onChange={e => set('maxSeats', e.target.value)} />
          </div>
        )}

        {/* Online fields */}
        {form.format === 'ONLINE' && (
          <>
            <div>
              <label style={{ color: '#9ca3af', fontSize: '0.875rem', display: 'block', marginBottom: 4 }}>
                Platform Link
              </label>
              <input type="url" placeholder="https://..." value={form.onlineLink} style={inputStyle}
                onChange={e => set('onlineLink', e.target.value)} />
            </div>
            <div>
              <label style={{ color: '#9ca3af', fontSize: '0.875rem', display: 'block', marginBottom: 4 }}>
                Room Password (optional)
              </label>
              <input type="text" value={form.onlinePassword} style={inputStyle}
                onChange={e => set('onlinePassword', e.target.value)} />
            </div>
          </>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '0.625rem', borderRadius: '0.5rem',
            background: '#16a34a', color: 'white', fontWeight: 600,
            fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, border: 'none',
          }}
        >
          {loading ? 'Creating...' : 'Create Event'}
        </button>

      </div>
    </div>
  )
}