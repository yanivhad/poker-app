import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/role'
import * as EventController from '../controllers/event.controller'

const r = Router()
r.get(   '/upcoming', authenticate, EventController.getUpcoming)
r.get(   '/active',   authenticate, EventController.getActive)
r.get(   '/',         authenticate, EventController.getAll)
r.get(   '/:id',      authenticate, EventController.getOne)
r.post(  '/',         authenticate, requireAdmin, EventController.create)
r.put(   '/:id',      authenticate, requireAdmin, EventController.update)
r.patch( '/:id/host', authenticate, EventController.assignHost)
r.delete('/:id',      authenticate, requireAdmin, EventController.remove)

export default r