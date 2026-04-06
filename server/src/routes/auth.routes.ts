import { Router } from 'express'
import * as AuthController from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth'

const r = Router()
r.post('/login',   AuthController.login)
r.post('/refresh', AuthController.refresh)
r.post('/logout',  authenticate, AuthController.logout)
export default r
