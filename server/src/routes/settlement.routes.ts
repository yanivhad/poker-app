import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'
import { Response } from 'express'

const r = Router()

r.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const s = await prisma.settlement.update({
      where: { id: req.params.id },
      data:  { status: req.body.status }
    })
    res.json(s)
  } catch (e: any) { res.status(400).json({ message: e.message }) }
})

export default r