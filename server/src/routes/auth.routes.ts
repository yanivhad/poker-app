import { Router } from 'express'
import * as AuthController from '../controllers/auth.controller'
const r = Router()
r.post('/request-otp', AuthController.requestOtp)
r.post('/verify-otp',  AuthController.verifyOtp)
r.post('/refresh',     AuthController.refresh)
export default r
