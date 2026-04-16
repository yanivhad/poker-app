import { Router } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireMaster } from '../middleware/role'
import * as GangService from '../services/gang.service'
import { prisma } from '../lib/prisma'
import { Response } from 'express'

const r = Router()

// Helper: check if user is approved member of a specific gang (by URL param :id)
const assertGangMember = async (req: AuthRequest, res: Response): Promise<boolean> => {
  if (req.user?.role === 'MASTER' || req.user?.role === 'ADMIN') return true
  const m = await prisma.gangMember.findUnique({
    where: { gangId_userId: { gangId: req.params.id, userId: req.user!.userId } }
  })
  if (!m || m.status !== 'APPROVED') {
    res.status(403).json({ message: 'Not a member of this gang' })
    return false
  }
  req.gangRole = m.role as 'ADMIN' | 'MEMBER'
  return true
}

const assertGangAdmin = (req: AuthRequest, res: Response): boolean => {
  if (req.user?.role === 'MASTER' || req.user?.role === 'ADMIN') return true
  if (req.gangRole !== 'ADMIN') {
    res.status(403).json({ message: 'Gang admin access required' })
    return false
  }
  return true
}

// List gangs — always returns { id, name, memberCount, myStatus, role } for all users.
// MASTER/ADMIN get myStatus='APPROVED', role='ADMIN' for every gang.
r.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const allGangs = await GangService.getAllGangs()
    const isMaster = req.user?.role === 'MASTER' || req.user?.role === 'ADMIN'

    if (isMaster) {
      const gangs = allGangs.map((g: any) => ({
        id:          g.id,
        name:        g.name,
        memberCount: g.members.filter((m: any) => m.status === 'APPROVED').length,
        myStatus:    'APPROVED',
        role:        'ADMIN',
      }))
      return res.json(gangs)
    }

    const myMemberships = await prisma.gangMember.findMany({ where: { userId: req.user!.userId } })
    const statusMap = new Map(myMemberships.map(m => [m.gangId, { status: m.status, role: m.role }]))
    const gangs = allGangs.map((g: any) => ({
      id:          g.id,
      name:        g.name,
      memberCount: g.members.filter((m: any) => m.status === 'APPROVED').length,
      myStatus:    statusMap.get(g.id)?.status ?? null,
      role:        statusMap.get(g.id)?.role   ?? null,
    }))
    res.json(gangs)
  } catch (e: any) { res.status(500).json({ message: e.message }) }
})

// Get single gang
r.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!await assertGangMember(req, res)) return
    res.json(await GangService.getGangById(req.params.id))
  } catch { res.status(404).json({ message: 'Gang not found' }) }
})

// Create gang — MASTER only
r.post('/', authenticate, requireMaster, async (req: AuthRequest, res: Response) => {
  try { res.status(201).json(await GangService.createGang(req.body.name)) }
  catch (e: any) { res.status(400).json({ message: e.message }) }
})

// Update gang name — MASTER or gang admin
r.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!await assertGangMember(req, res)) return
    if (!assertGangAdmin(req, res)) return
    res.json(await GangService.updateGang(req.params.id, req.body.name))
  } catch (e: any) { res.status(400).json({ message: e.message }) }
})

// Delete gang — MASTER only
r.delete('/:id', authenticate, requireMaster, async (req: AuthRequest, res: Response) => {
  try { res.json(await GangService.deleteGang(req.params.id)) }
  catch (e: any) { res.status(400).json({ message: e.message }) }
})

// Get members (gang admin sees PENDING too; members see APPROVED only)
r.get('/:id/members', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!await assertGangMember(req, res)) return
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
r.patch('/:id/members/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!await assertGangMember(req, res)) return
    if (!assertGangAdmin(req, res)) return
    const { role, status } = req.body
    res.json(await GangService.updateMember(req.params.id, req.params.userId, { role, status }))
  } catch (e: any) { res.status(400).json({ message: e.message }) }
})

// Remove member — gang admin or self-leave
r.delete('/:id/members/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const isSelf   = req.user!.userId === req.params.userId
    const isMaster = req.user?.role === 'MASTER' || req.user?.role === 'ADMIN'
    if (!isSelf && !isMaster) {
      if (!await assertGangMember(req, res)) return
      if (!assertGangAdmin(req, res)) return
    }
    res.json(await GangService.removeMember(req.params.id, req.params.userId))
  } catch (e: any) { res.status(400).json({ message: e.message }) }
})

export default r
