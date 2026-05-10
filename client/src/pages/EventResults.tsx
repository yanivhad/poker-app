import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Spinner from '../components/ui/Spinner'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'

export default function EventResultsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState<any>(null) // eslint-disable-line
  const [players, setPlayers]   = useState<any[]>([])
  const [results, setResults]   = useState<Record<string, { buyIns: number; finalChips: number }>>({})
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [allUsers, setAllUsers] = useState<any[]>([])
  const { toast, showToast, hideToast } = useToast()

  const load = async () => {
    try {
      const [evtRes, playersRes, usersRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/events/${id}/players`),
        api.get('/users'),
      ])
      setEvent(evtRes.data)
      setPlayers(playersRes.data)
      setAllUsers(usersRes.data)
      // Init results — preserve existing entries for players already in state
      setResults(prev => {
        const init: Record<string, { buyIns: number; finalChips: number }> = {}
        playersRes.data.forEach((p: any) => {
          const key = p.userId ?? p.guestId
          init[key] = prev[key] ?? { buyIns: 1, finalChips: 500 }
        })
        return init
      })
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const addPlayer = async (userId: string, source: string) => {
    try {
      await api.post(`/events/${id}/players`, { userId, source })
      await load()
    } catch (e: any) { showToast(e.response?.data?.message, 'error')
 }
  }

  const addGuest = async () => {
    if (!guestName.trim()) return
    try {
      await api.post(`/events/${id}/players`, { guestName: guestName.trim(), source: 'GUEST' })
      setGuestName('')
      await load()
    } catch (e: any) {  showToast(e.response?.data?.message, 'error')
 }
  }

  const removePlayer = async (epId: string) => {
    try {
      await api.delete(`/events/${id}/players/${epId}`)
      await load()
    } catch (e: any) {   showToast(e.response?.data?.message, 'error')
 }
  }

  const buildPayload = () => players.map((p: any) => {
    const key = p.userId ?? p.guestId
    return {
      userId:     p.userId  ?? null,
      guestId:    p.guestId ?? null,
      buyIns:     results[key]?.buyIns     ?? 1,
      finalChips: results[key]?.finalChips ?? 500,
    }
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.post(`/events/${id}/results`, { results: buildPayload() })
      showToast('Results saved!', 'success')
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Error saving', 'error')
    } finally { setSaving(false) }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await api.post(`/events/${id}/results`, { results: buildPayload() })
      await api.post(`/events/${id}/settlements`)
      navigate(`/events/${id}/settlement`)
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Error', 'error')
    } finally { setSubmitting(false) }
  }

  const totalPot = players.reduce((sum, p) => {
    const key = p.userId ?? p.guestId
    return sum + (results[key]?.buyIns ?? 1) * 50
  }, 0)

  const totalChips = players.reduce((sum, p) => {
    const key = p.userId ?? p.guestId
    return sum + (results[key]?.finalChips ?? 500)
  }, 0)

  const expectedChips = players.reduce((sum, p) => {
    const key = p.userId ?? p.guestId
    return sum + (results[key]?.buyIns ?? 1) * 500
  }, 0)

  const chipsBalanced = totalChips === expectedChips

  const confirmedIds = new Set(players.map((p: any) => p.userId).filter(Boolean))
  const availableUsers = allUsers.filter((u: any) => !confirmedIds.has(u.id))

if (loading) return <Spinner />
  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h1 style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1rem' }}>
        📝 Enter Results
      </h1>

      {event?.resultsSubmittedBy && (
        <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#9ca3af' }}>
          Last submitted by <span style={{ color: 'white', fontWeight: 600 }}>{event.resultsSubmittedBy.nickname}</span>
          {event.resultsSubmittedAt && (
            <> · {new Date(event.resultsSubmittedAt).toLocaleString('en-IL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</>
          )}
        </div>
      )}

      {/* Add players */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Who Played?</h2>

        {/* Add app member */}
        {availableUsers.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <select
              id="userSelect"
              style={{ flex: 1, background: '#1a1a2e', color: 'white', border: '1px solid #4b5563', borderRadius: '0.5rem', padding: '0.375rem 0.75rem' }}
            >
              {availableUsers.map((u: any) => (
                <option key={u.id} value={u.id}>{u.nickname}</option>
              ))}
            </select>
            <button
              onClick={() => {
                const sel = document.getElementById('userSelect') as HTMLSelectElement
                addPlayer(sel.value, 'UNREGISTERED_MEMBER')
              }}
              style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer' }}
            >+ Member</button>
          </div>
        )}

        {/* Add guest */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="Guest name..."
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addGuest()}
            style={{ flex: 1, background: '#1a1a2e', color: 'white', border: '1px solid #4b5563', borderRadius: '0.5rem', padding: '0.375rem 0.75rem' }}
          />
          <button
            onClick={addGuest}
            style={{ background: '#374151', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer' }}
          >+ Guest</button>
        </div>
      </div>

      {/* Results table */}
      {players.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontWeight: 600, marginBottom: 12 }}>Results</h2>
          {players.map((p: any) => {
            const key      = p.userId ?? p.guestId
            const name     = p.user?.nickname ?? p.guest?.name ?? 'Guest'
            const r        = results[key] ?? { buyIns: 1, finalChips: 500 }
            const net      = Math.round(((r.finalChips - r.buyIns * 500) / 10) / 25) * 25

            return (
              <div key={p.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #1f2937' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, color: 'white' }}>{name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, color: net >= 0 ? '#16a34a' : '#ef4444', fontSize: '0.875rem' }}>
                      {net >= 0 ? '+' : ''}{net.toFixed(0)}₪
                    </span>
                    <button onClick={() => removePlayer(p.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Buy-ins</label>
                    <input
                      type="number" min={1} max={10} value={r.buyIns}
                      onChange={e => setResults(prev => ({ ...prev, [key]: { ...r, buyIns: Number(e.target.value) } }))}
                      style={{ width: '100%', background: '#1a1a2e', color: 'white', border: '1px solid #4b5563', borderRadius: '0.5rem', padding: '0.375rem 0.5rem', textAlign: 'center' }}
                    />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Final Chips</label>
                    <input
                      type="number" min={0} step={10} value={r.finalChips}
                      onChange={e => setResults(prev => ({ ...prev, [key]: { ...r, finalChips: Number(e.target.value) } }))}
                      style={{ width: '100%', background: '#1a1a2e', color: 'white', border: '1px solid #4b5563', borderRadius: '0.5rem', padding: '0.375rem 0.5rem', textAlign: 'center' }}
                    />
                  </div>
                </div>
              </div>
            )
          })}

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', fontSize: '0.875rem', marginTop: 8 }}>
            <span>Total pot: <span style={{ color: 'white', fontWeight: 600 }}>{totalPot}₪</span></span>
            <span style={{ color: chipsBalanced ? '#16a34a' : '#ef4444' }}>
              Chips: {totalChips} / {expectedChips} {chipsBalanced ? '✅' : '⚠️'}
            </span>
          </div>
        </div>
      )}

      {players.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={handleSave}
            disabled={saving || submitting}
            style={{
              width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
              background: '#374151', color: 'white', fontWeight: 600, fontSize: '1rem',
              border: '1px solid #4b5563', cursor: 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving...' : '💾 Save Progress'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || saving || !chipsBalanced}
            style={{
              width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
              background: chipsBalanced ? '#16a34a' : '#374151',
              color: 'white', fontWeight: 600, fontSize: '1rem',
              border: 'none', cursor: chipsBalanced ? 'pointer' : 'not-allowed',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Calculating...' : !chipsBalanced ? '⚠️ Chips must balance to submit' : '✅ Submit & Calculate Settlement'}
          </button>
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}