import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth.store'
import AppShell from './components/layout/AppShell'
import LoginPage        from './pages/Login'
import HomePage         from './pages/Home'
import EventPage        from './pages/EventDetail'
import CasesPage        from './pages/PokerCases'
import StatsPage        from './pages/Stats'
import ProfilePage      from './pages/Profile'
import CreateEventPage  from './pages/admin/CreateEvent'
import EventResultsPage from './pages/EventResults'
import SettlementPage   from './pages/Settlement'
import PlayersPage      from './pages/Players'
import EventHistoryPage from './pages/EventHistory'
import AddPlayerPage    from './pages/admin/AddPlayer'
import EditEventPage    from './pages/admin/EditEvent'
import AboutPage        from './pages/About'
import GangListPage     from './pages/GangList'
import GangDetailPage   from './pages/GangDetail'
import GangSelectPage   from './pages/GangSelect'
import React from 'react'

function RequireAuth({ children }: { children: React.ReactElement }) {
  const user    = useAuthStore(s => s.user)
  const loading = useAuthStore(s => s.loading)
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

// Redirect to gang selection if user has multiple gangs and none is active
function RequireGang({ children }: { children: React.ReactElement }) {
  const user       = useAuthStore(s => s.user)
  const gangs      = useAuthStore(s => s.gangs)
  const activeGang = useAuthStore(s => s.activeGang)
  const isMaster   = user?.role === 'MASTER' || user?.role === 'ADMIN'
  // MASTER can operate without a gang; single-gang users are auto-selected
  if (!isMaster && gangs.length > 1 && !activeGang) return <Navigate to="/gang-select" replace />
  return children
}

export default function App() {
  const loadUser = useAuthStore(s => s.loadUser)
  useEffect(() => { loadUser() }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RequireAuth><AppShell /></RequireAuth>}>
          <Route index element={<RequireGang><HomePage /></RequireGang>} />
          <Route path="gang-select"              element={<GangSelectPage />} />
          <Route path="gangs"                    element={<GangListPage />} />
          <Route path="gangs/:id"                element={<GangDetailPage />} />
          <Route path="events/:id"               element={<EventPage />} />
          <Route path="admin/events/new"         element={<CreateEventPage />} />
          <Route path="cases"                    element={<RequireGang><CasesPage /></RequireGang>} />
          <Route path="stats"                    element={<StatsPage />} />
          <Route path="profile"                  element={<ProfilePage />} />
          <Route path="events/:id/results"       element={<EventResultsPage />} />
          <Route path="players"                  element={<PlayersPage />} />
          <Route path="history"                  element={<RequireGang><EventHistoryPage /></RequireGang>} />
          <Route path="admin/players/new"        element={<AddPlayerPage />} />
          <Route path="admin/events/:id/edit"    element={<EditEventPage />} />
          <Route path="events/:id/settlement"    element={<SettlementPage />} />
          <Route path="about"                    element={<AboutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
