import app from './app'
import { ENV } from './config/env'
import './jobs'
app.listen(ENV.PORT, () => console.log(`🃏 Server running on http://localhost:${ENV.PORT}`))
