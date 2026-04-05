import express from 'express'
import cors from 'cors'
import { ENV } from './config/env'
import authRoutes         from './routes/auth.routes'
import userRoutes         from './routes/user.routes'
import eventRoutes        from './routes/event.routes'
import registrationRoutes from './routes/registration.routes'
import resultRoutes       from './routes/result.routes'
import settlementRoutes   from './routes/settlement.routes'
import caseRoutes         from './routes/case.routes'
import checklistRoutes    from './routes/checklist.routes'
import statsRoutes        from './routes/stats.routes'
const app = express()
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }))
app.use(express.json())
app.get('/api/health', (_, res) => res.json({ status: 'ok' }))
app.use('/api/auth',        authRoutes)
app.use('/api/users',       userRoutes)
app.use('/api/events',      eventRoutes)
app.use('/api/events',      registrationRoutes)
app.use('/api/events',      resultRoutes)
app.use('/api/events',      checklistRoutes)
app.use('/api/settlements', settlementRoutes)
app.use('/api/cases',       caseRoutes)
app.use('/api/stats',       statsRoutes)
export default app
