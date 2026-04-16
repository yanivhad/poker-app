import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/role'
import { requireGangMember } from '../middleware/gang'
import * as EventController from '../controllers/event.controller'

const r = Router()
r.get(   '/upcoming', authenticate, requireGangMember, EventController.getUpcoming)
r.get(   '/active',   authenticate, requireGangMember, EventController.getActive)
r.get(   '/',         authenticate, requireGangMember, EventController.getAll)
r.get(   '/:id',      authenticate, EventController.getOne)
r.post(  '/',         authenticate, requireGangMember, EventController.create)
r.put(   '/:id',      authenticate, EventController.update)
r.patch( '/:id/host', authenticate, EventController.assignHost)
r.delete('/:id',      authenticate, requireAdmin, EventController.remove)

export default r