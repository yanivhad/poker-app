import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth.store'
import AppShell from './components/layout/AppShell'
import LoginPage  from './pages/Login'
import HomePage   from './pages/Home'
import EventPage  from './pages/EventDetail'
import CasesPage  from './pages/PokerCases'
import StatsPage  from './pages/Stats'
import ProfilePage from './pages/Profile'
import CreateEventPage from './pages/admin/CreateEvent'
import EventResultsPage from './pages/EventResults'
import SettlementPage   from './pages/Settlement'
import PlayersPage from './pages/Players'
import EventHistoryPage from './pages/EventHistory'
import AddPlayerPage from './pages/admin/AddPlayer'
import React from 'react'

function RequireAuth({ children }: { children: React.ReactElement }) {  const user = useAuthStore(s => s.user)
  const loading = useAuthStore(s => s.loading)
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
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
          <Route index element={<HomePage />} />
          <Route path="events/:id" element={<EventPage />} />
          <Route path="admin/events/new" element={<CreateEventPage />} />
          <Route path="cases"   element={<CasesPage />} />
          <Route path="stats"   element={<StatsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="events/:id/results"    element={<EventResultsPage />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="history" element={<EventHistoryPage />} />
          <Route path="admin/players/new" element={<AddPlayerPage />} />
<Route path="events/:id/settlement" element={<SettlementPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}