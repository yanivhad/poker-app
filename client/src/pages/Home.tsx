import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import {
  getActiveEvents, registerForEvent, cancelRegistration, assignHost,
  getChecklist, addChecklistItem, toggleChecklistItem, deleteChecklistItem
} from '../api/events.api'
import Spinner from '../components/ui/Spinner'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'
import { shareEventOpen } from '../utils/whatsapp'
import api from '../api/axios'

export default function HomePage() {
  const [events, setEvents]         = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [actioning, setActioning]   = useState<string | null>(null)
  const [checklists, setChecklists] = useState<Record<string, any[]>>({})
  const [newItems, setNewItems]     = useState<Record<string, string>>({})
  const user     = useAuthStore(s => s.user)
  const navigate = useNavigate()
  const { toast, showToast, hideToast } = useToast()

  const load = async () => {
    try {
      const data = await getActiveEvents()
      setEvents(data)
      for (const evt of data) {
        if (evt.format === 'IN_PERSON') {
          const items = await getChecklist(evt.id)
          setChecklists(cl => ({ ...cl, [evt.id]: items }))
        }
      }
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleRegister = async (eventId: string) => {
    setActioning(eventId)
    try {
      await registerForEvent(eventId)
      await load()
      showToast('Registered successfully!')
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Error', 'error')
    } finally { setActioning(null) }
  }

  const handleCancel = async (eventId: string) => {
    setActioning(eventId)
    try {
      await cancelRegistration(eventId)
      await load()
      showToast('Registration cancelled')
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Error', 'error')
    } finally { setActioning(null) }
  }

  const handleAssignHost = async (eventId: string) => {
    try {
      await assignHost(eventId)
      await load()
      showToast('You are now the host!')
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Error', 'error')
    }
  }

  const handleStatusChange = async (eventId: string, status: string) => {
    try {
      await api.put(`/events/${eventId}`, { status })
      await load()
      showToast(`Event ${status.toLowerCase()}`)
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Error', 'error')
    }
  }

  const handleAddItem = async (eventId: string) => {
    const label = newItems[eventId]?.trim()
    if (!label) return
    const item = await addChecklistItem(eventId, label)
    setChecklists(cl => ({ ...cl, [eventId]: [...(cl[eventId] ?? []), item] }))
    setNewItems(n => ({ ...n, [eventId]: '' }))
  }

  if (loading) return <Spinner />

  if (events.length === 0) return (
    <div style={{ textAlign: 'center', marginTop: 60 }}>
      <div style={{ fontSize: '3rem', marginBottom: 8 }}>🃏</div>
      <p style={{ color: '#9ca3af', marginBottom: 16 }}>No upcoming events.</p>
      {user?.role === 'ADMIN' && (
        <button
          onClick={() => navigate('/admin/events/new')}
          style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1.25rem', cursor: 'pointer', fontWeight: 600 }}
        >
          + Create Event
        </button>
      )}
    </div>
  )

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.25rem' }}>Upcoming Events</h1>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => navigate('/admin/events/new')}
            style={{ background: '#374151', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            + New Event
          </button>
        )}
      </div>

      {events.map(event => {
        const eventDate = new Date(event.date)
        const isOpen    = event.status === 'OPEN'
        const isHost    = event.hostId === user?.id
        const myReg     = event.registrations?.find((r: any) => r.user?.id === user?.id)
        const confirmed = event.registrations?.filter((r: any) => r.status === 'CONFIRMED') ?? []
        const waitlist  = event.registrations?.filter((r: any) => r.status === 'WAITLIST')  ?? []
        const checklist = checklists[event.id] ?? []
        const newItem   = newItems[event.id] ?? ''

        return (
          <div key={event.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            {/* Event card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '1.125rem', color: 'white' }}>
                    {event.format === 'ONLINE' ? '💻 Online' : '🏠 In Person'}
                    {' · '}
                    {event.type === 'SPECIAL' ? '🏆 Special' : 'Ordinary'}
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                    {eventDate.toLocaleDateString('en-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
                    {' at '}
                    {eventDate.toLocaleTimeString('en-IL', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span style={{
                  fontSize: '0.75rem', padding: '2px 10px', borderRadius: 99, fontWeight: 500,
                  background: isOpen ? '#16a34a22' : event.status === 'CANCELLED' ? '#7f1d1d33' : '#37415133',
                  color: isOpen ? '#16a34a' : event.status === 'CANCELLED' ? '#ef4444' : '#9ca3af',
                }}>
                  {event.status}
                </span>
              </div>

              {event.lastRoundTime && (
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  🔔 Last round: {new Date(event.lastRoundTime).toLocaleTimeString('en-IL', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}

              {event.host && (
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  🏠 Host: <span style={{ color: 'white', fontWeight: 500 }}>{event.host.nickname}</span>
                </p>
              )}

              <a
                href={shareEventOpen(event)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block', marginTop: 4,
                  background: '#25D366', color: 'white',
                  padding: '0.375rem 0.75rem', borderRadius: '0.5rem',
                  fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
                }}
              >
                📤 Share to WhatsApp
              </a>
            </div>

            {/* Admin controls */}
            {user?.role === 'ADMIN' && (
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ color: '#9ca3af', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                  Admin Controls
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {event.status === 'DRAFT' && (
                    <button
                      onClick={() => handleStatusChange(event.id, 'OPEN')}
                      style={{ flex: 1, padding: '0.375rem', borderRadius: '0.5rem', background: '#16a34a', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                    >
                      ✅ Open Registration
                    </button>
                  )}
                  {['OPEN', 'CLOSED'].includes(event.status) && (
                    <>
                      <button
                        onClick={() => navigate(`/events/${event.id}/results`)}
                        style={{ flex: 1, padding: '0.375rem', borderRadius: '0.5rem', background: '#374151', color: 'white', border: '1px solid #4b5563', cursor: 'pointer', fontSize: '0.875rem' }}
                      >
                        📝 Enter Results
                      </button>
                      {event.status === 'OPEN' && (
                        <button
                          onClick={() => handleStatusChange(event.id, 'CLOSED')}
                          style={{ flex: 1, padding: '0.375rem', borderRadius: '0.5rem', background: '#92400e33', color: '#f59e0b', border: '1px solid #92400e', cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                          🔒 Close
                        </button>
                      )}
                      {event.status === 'CLOSED' && (
                        <button
                          onClick={() => handleStatusChange(event.id, 'OPEN')}
                          style={{ flex: 1, padding: '0.375rem', borderRadius: '0.5rem', background: '#16a34a33', color: '#16a34a', border: '1px solid #16a34a', cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                          🔓 Reopen
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusChange(event.id, 'CANCELLED')}
                        style={{ flex: 1, padding: '0.375rem', borderRadius: '0.5rem', background: '#7f1d1d33', color: '#ef4444', border: '1px solid #7f1d1d', cursor: 'pointer', fontSize: '0.875rem' }}
                      >
                        ❌ Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Host assignment */}
            {!event.host && myReg?.status === 'CONFIRMED' && (
              <button
                onClick={() => handleAssignHost(event.id)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', background: '#374151', color: 'white', border: '1px solid #4b5563', cursor: 'pointer' }}
              >
                🙋 Volunteer as Host
              </button>
            )}

            {/* Registration */}
            {isOpen && (
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontWeight: 600, color: 'white' }}>
                    Players ({confirmed.length}/{event.maxSeats})
                  </h2>
                  {waitlist.length > 0 && (
                    <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>
                      {waitlist.length} on waitlist
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {confirmed.map((r: any, i: number) => (
                    <div key={r.user.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem' }}>
                      <span style={{ color: '#6b7280', width: 20 }}>{i + 1}.</span>
                      <span style={{ color: r.user.id === user?.id ? '#16a34a' : 'white', fontWeight: r.user.id === user?.id ? 600 : 400 }}>
                        {r.user.nickname}
                      </span>
                    </div>
                  ))}
                </div>

                {waitlist.length > 0 && (
                  <div style={{ borderTop: '1px solid #1f2937', paddingTop: 8 }}>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: 4, textTransform: 'uppercase' }}>
                      Waitlist
                    </p>
                    {waitlist.map((r: any) => (
                      <div key={r.user.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: '#fbbf24' }}>
                        <span>⏳</span>
                        <span>{r.user.nickname}</span>
                      </div>
                    ))}
                  </div>
                )}

                {!myReg ? (
                  <button
                    onClick={() => handleRegister(event.id)}
                    disabled={actioning === event.id}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', background: '#16a34a', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {actioning === event.id ? 'Registering...' : 'Register'}
                  </button>
                ) : myReg.status === 'CONFIRMED' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p style={{ textAlign: 'center', color: '#16a34a', fontSize: '0.875rem', fontWeight: 600 }}>
                      ✅ You are in!
                    </p>
                    <button
                      onClick={() => handleCancel(event.id)}
                      disabled={actioning === event.id}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', background: '#7f1d1d33', color: '#ef4444', border: '1px solid #7f1d1d', cursor: 'pointer' }}
                    >
                      {actioning === event.id ? 'Cancelling...' : 'Cancel Registration'}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p style={{ textAlign: 'center', color: '#fbbf24', fontSize: '0.875rem', fontWeight: 600 }}>
                      ⏳ You are on the waitlist
                    </p>
                    <button
                      onClick={() => handleCancel(event.id)}
                      disabled={actioning === event.id}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', background: '#7f1d1d33', color: '#ef4444', border: '1px solid #7f1d1d', cursor: 'pointer' }}
                    >
                      {actioning === event.id ? 'Cancelling...' : 'Leave Waitlist'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Checklist */}
            {event.format === 'IN_PERSON' && (
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h2 style={{ fontWeight: 600, color: 'white' }}>📋 Host Checklist</h2>
                {checklist.length === 0 && (
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No items yet.</p>
                )}
                {checklist.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={item.isChecked}
                      onChange={async e => {
                        await toggleChecklistItem(event.id, item.id, e.target.checked)
                        setChecklists(cl => ({
                          ...cl,
                          [event.id]: cl[event.id].map(i => i.id === item.id ? { ...i, isChecked: e.target.checked } : i)
                        }))
                      }}
                    />
                    <span style={{ color: item.isChecked ? '#6b7280' : 'white', textDecoration: item.isChecked ? 'line-through' : 'none', flex: 1 }}>
                      {item.label}
                    </span>
                    {isHost && (
                      <button
                        onClick={async () => {
                          await deleteChecklistItem(event.id, item.id)
                          setChecklists(cl => ({ ...cl, [event.id]: cl[event.id].filter(i => i.id !== item.id) }))
                        }}
                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {isHost && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      placeholder="Add item..."
                      value={newItem}
                      onChange={e => setNewItems(n => ({ ...n, [event.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleAddItem(event.id)}
                      style={{ flex: 1, background: '#1a1a2e', color: 'white', border: '1px solid #4b5563', borderRadius: '0.5rem', padding: '0.375rem 0.75rem' }}
                    />
                    <button
                      onClick={() => handleAddItem(event.id)}
                      style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid #1f2937' }} />
          </div>
        )
      })}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}