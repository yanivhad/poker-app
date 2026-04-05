import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/role'
import * as UserController from '../controllers/user.controller'

const r = Router()

r.get(  '/',           authenticate, requireAdmin, UserController.getAll)
r.get(  '/me',         authenticate, UserController.getMe)
r.get(  '/:id',        authenticate, UserController.getOne)
r.post( '/',           authenticate, requireAdmin, UserController.create)
r.put(  '/:id',        authenticate, UserController.update)
r.patch('/:id/status', authenticate, requireAdmin, UserController.setActive)

export default r