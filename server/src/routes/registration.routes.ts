import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/role'
import * as RegController from '../controllers/registration.controller'

const r = Router()

r.get(   '/:id/registrations', authenticate, requireAdmin, RegController.listRegistrations)
r.post(  '/:id/register',      authenticate, RegController.registerForEvent)
r.delete('/:id/register',      authenticate, RegController.cancelRegistration)

export default r