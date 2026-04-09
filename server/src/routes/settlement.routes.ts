import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'
import { Response } from 'express'

const r = Router()

r.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body
    const data: any = { status }
    if (status === 'SENT') data.reportPayAt = new Date()
    const s = await prisma.settlement.update({ where: { id: req.params.id }, data })
    res.json(s)
  } catch (e: any) { res.status(400).json({ message: e.message }) }
})

export default r