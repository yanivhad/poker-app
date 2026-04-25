import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/role'
import { requireGangMember, requireGangAdmin } from '../middleware/gang'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'
import { Response } from 'express'

const r = Router()

r.get('/', authenticate, requireGangMember, async (req: AuthRequest, res: Response) => {
  try {
    const cases = await prisma.pokerCase.findMany({
      where:   req.gangId ? { OR: [{ gangId: req.gangId }, { gangId: null }] } : {},
      include: { heldBy: { select: { id: true, nickname: true } } },
      orderBy: { type: 'asc' }
    })
    res.json(cases)
  } catch (e: any) { res.status(500).json({ message: e.message }) }
})

r.patch('/:id/holder', authenticate, requireGangMember, requireGangAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const c = await prisma.pokerCase.update({
      where: { id: req.params.id },
      data:  { heldByUserId: req.body.userId },
      include: { heldBy: { select: { id: true, nickname: true } } }
    })
    res.json(c)
  } catch (e: any) { res.status(400).json({ message: e.message }) }
})

r.patch('/:id/label', authenticate, requireGangMember, requireGangAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const c = await prisma.pokerCase.update({
      where: { id: req.params.id },
      data:  { label: req.body.label },
      include: { heldBy: { select: { id: true, nickname: true } } }
    })
    res.json(c)
  } catch (e: any) { res.status(400).json({ message: e.message }) }
})

export default r
