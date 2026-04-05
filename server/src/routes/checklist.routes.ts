import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'
import { Response } from 'express'

const r = Router()

r.get('/:id/checklist', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.checklistItem.findMany({
      where: { eventId: req.params.id },
      orderBy: { createdAt: 'asc' }
    })
    res.json(items)
  } catch (e: any) { res.status(500).json({ message: e.message }) }
})

r.post('/:id/checklist', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.checklistItem.create({
      data: { eventId: req.params.id, label: req.body.label, addedById: req.user!.userId }
    })
    res.status(201).json(item)
  } catch (e: any) { res.status(400).json({ message: e.message }) }
})

r.patch('/:id/checklist/:itemId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.checklistItem.update({
      where: { id: req.params.itemId },
      data:  { isChecked: req.body.isChecked }
    })
    res.json(item)
  } catch (e: any) { res.status(400).json({ message: e.message }) }
})

r.delete('/:id/checklist/:itemId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.checklistItem.delete({ where: { id: req.params.itemId } })
    res.json({ message: 'Deleted' })
  } catch (e: any) { res.status(400).json({ message: e.message }) }
})

export default r