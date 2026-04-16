import { Router } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireMaster } from '../middleware/role'
import { requireGangMember, requireGangAdmin } from '../middleware/gang'
import * as GangService from '../services/gang.service'
import { Response } from 'express'

const r = Router()

// List gangs — MASTER sees all, others see their approved gangs + all gangs for browse
r.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role === 'MASTER' || req.user?.role === 'ADMIN') {
      return res.json(await GangService.getAllGangs())
    }
    // For regular players: return all gangs with their own membership status
    const allGangs = await GangService.getAllGangs()
    const myMemberships = await GangService.getUserGangs(req.user!.userId)
    const myPending = await require('../lib/prisma').prisma.gangMember.findMany({
      where: { userId: req.user!.userId },
    })
    const statusMap = new Map(myPending.map((m: any) => [m.gangId, m.status]))
    const gangs = allGangs.map((g: any) => ({
      id:           g.id,
      name:         g.name,
      memberCount:  g.members.filter((m: any) => m.status === 'APPROVED').length,
      myStatus:     statusMap.get(g.id) ?? null,
    }))
    res.json(gangs)
  } catch (e: any) { res.status(500).json({ message: e.message }) }
})

// Get single gang (members can see it)
r.get('/:id', authenticate, requireGangMember, async (req: AuthRequest, res: Response) => {
  try { res.json(await GangService.getGangById(req.params.id)) }
  catch { res.status(404).json({ message: 'Gang not found' }) }
})

// Create gang — MASTER only
r.post('/', authenticate, requireMaster, async (req: AuthRequest, res: Response) => {
  try { res.status(201).json(await GangService.createGang(req.body.name)) }
  catch (e: any) { res.status(400).json({ message: e.message }) }
})

// Update gang name — MASTER or gang admin
r.put('/:id', authenticate, requireGangMember, requireGangAdmin, async (req: AuthRequest, res: Response) => {
  try { res.json(await GangService.updateGang(req.params.id, req.body.name)) }
  catch (e: any) { res.status(400).json({ message: e.message }) }
})

// Delete gang — MASTER only
r.delete('/:id', authenticate, requireMaster, async (req: AuthRequest, res: Response) => {
  try { res.json(await GangService.deleteGang(req.params.id)) }
  catch (e: any) { res.status(400).json({ message: e.message }) }
})

// Get members (gang admin sees PENDING too; members see APPROVED only)
r.get('/:id/members', authenticate, requireGangMember, async (req: AuthRequest, res: Response) => {
  try {
    const members = await GangService.getGangMembers(req.params.id)
    if (req.gangRole === 'ADMIN' || req.user?.role === 'MASTER' || req.user?.role === 'ADMIN') {
      return res.json(members)
    }
    res.json(members.filter((m: any) => m.status === 'APPROVED'))
  } catch (e: any) { res.status(500).json({ message: e.message }) }
})

// Request to join gang — any authenticated user
r.post('/:id/join', authenticate, async (req: AuthRequest, res: Response) => {
  try { res.status(201).json(await GangService.requestJoin(req.params.id, req.user!.userId)) }
  catch (e: any) { res.status(400).json({ message: e.message }) }
})

// Approve/reject or change role — gang admin
r.patch('/:id/members/:userId', authenticate, requireGangMember, requireGangAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { role, status } = req.body
    res.json(await GangService.updateMember(req.params.id, req.params.userId, { role, status }))
  } catch (e: any) { res.status(400).json({ message: e.message }) }
})

// Remove member — gang admin or self-leave
r.delete('/:id/members/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const isSelf    = req.user!.userId === req.params.userId
    const isMaster  = req.user?.role === 'MASTER' || req.user?.role === 'ADMIN'
    const gangId    = req.params.id
    if (!isSelf && !isMaster) {
      // Check if requester is gang admin
      const { prisma } = await import('../lib/prisma')
      const m = await prisma.gangMember.findUnique({
        where: { gangId_userId: { gangId, userId: req.user!.userId } }
      })
      if (!m || m.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' })
    }
    res.json(await GangService.removeMember(gangId, req.params.userId))
  } catch (e: any) { res.status(400).json({ message: e.message }) }
})

export default r
