import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'
import { Response } from 'express'

const r = Router()

// Get event players
r.get('/:id/players', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const players = await prisma.eventPlayer.findMany({
      where:   { eventId: req.params.id },
      include: { user: { select: { id: true, nickname: true } }, guest: true }
    })
    res.json(players)
  } catch (e: any) { res.status(500).json({ message: e.message }) }
})

// Add player to event
r.post('/:id/players', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, guestName, source } = req.body
    const eventId = req.params.id
    if (guestName) {
      const guest = await prisma.guest.create({ data: { name: guestName, eventId } })
      const ep = await prisma.eventPlayer.create({
        data: { eventId, guestId: guest.id, source: 'GUEST' },
        include: { guest: true }
      })
      return res.status(201).json(ep)
    }
    const ep = await prisma.eventPlayer.create({
      data: { eventId, userId, source },
      include: { user: { select: { id: true, nickname: true } } }
    })
    res.status(201).json(ep)
  } catch (e: any) { res.status(400).json({ message: e.message }) }
})

// Remove player
r.delete('/:id/players/:epId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.eventPlayer.delete({ where: { id: req.params.epId } })
    res.json({ message: 'Removed' })
  } catch (e: any) { res.status(400).json({ message: e.message }) }
})

// Submit results
r.post('/:id/results', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { results } = req.body
    const eventId = req.params.id
    for (const result of results) {
      const netNIS = (result.finalChips - result.buyIns * 500) / 10
      if (result.userId) {
        await prisma.buyIn.upsert({
          where:  { eventId_userId: { eventId, userId: result.userId } },
          update: { count: result.buyIns },
          create: { eventId, userId: result.userId, count: result.buyIns }
        })
        await prisma.result.upsert({
          where:  { eventId_userId: { eventId, userId: result.userId } },
          update: { finalChips: result.finalChips, netNIS },
          create: { eventId, userId: result.userId, finalChips: result.finalChips, netNIS }
        })
      } else if (result.guestId) {
        await prisma.buyIn.upsert({
          where:  { guestId: result.guestId },
          update: { count: result.buyIns },
          create: { eventId, guestId: result.guestId, count: result.buyIns }
        })
        await prisma.result.upsert({
          where:  { guestId: result.guestId },
          update: { finalChips: result.finalChips, netNIS },
          create: { eventId, guestId: result.guestId, finalChips: result.finalChips, netNIS }
        })
      }
    }
    await prisma.event.update({
      where: { id: eventId },
      data:  { status: 'DONE', resultsSubmittedById: req.user!.userId, resultsSubmittedAt: new Date() }
    })
    res.json({ message: 'Results saved' })
  } catch (e: any) { res.status(400).json({ message: e.message }) }
})

// Get results
r.get('/:id/results', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const eventId = req.params.id
    const [results, buyIns] = await Promise.all([
      prisma.result.findMany({
        where:   { eventId },
        include: {
          user:  { select: { id: true, nickname: true } },
          guest: true,
        }
      }),
      prisma.buyIn.findMany({ where: { eventId } }),
    ])
    const buyInMap = new Map(buyIns.map(b => [b.userId ?? b.guestId, b]))
    res.json(results.map(r => ({ ...r, buyIn: buyInMap.get(r.userId ?? r.guestId) ?? null })))
  } catch (e: any) { res.status(500).json({ message: e.message }) }
})

// Get settlements
r.get('/:id/settlements', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const settlements = await prisma.settlement.findMany({
      where:   { eventId: req.params.id },
      include: {
        fromUser: { select: { id: true, nickname: true } },
        toUser:   { select: { id: true, nickname: true } },
      }
    })
    res.json(settlements)
  } catch (e: any) { res.status(500).json({ message: e.message }) }
})

// Calculate and save settlements
r.post('/:id/settlements', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const eventId = req.params.id
    const results = await prisma.result.findMany({
      where:   { eventId },
      include: { user: { select: { id: true, nickname: true } }, guest: true }
    })
    const { calculateSettlements } = await import('../utils/settlementCalc')
    const balances = results.map(r => ({
      id:      r.userId ?? r.guestId!,
      name:    r.user?.nickname ?? r.guest?.name ?? 'Guest',
      netNIS:  r.netNIS,
      isGuest: !r.userId,
    }))
    const transactions = calculateSettlements(balances)
    await prisma.settlement.deleteMany({ where: { eventId } })
    for (const t of transactions) {
      const fromIsGuest = balances.find(b => b.id === t.from)?.isGuest
      const toIsGuest   = balances.find(b => b.id === t.to)?.isGuest
      await prisma.settlement.create({
        data: {
          eventId,
          fromUserId:    fromIsGuest ? null : t.from,
          fromGuestId:   fromIsGuest ? t.from : null,
          fromGuestName: fromIsGuest ? t.fromName : null,
          toUserId:      toIsGuest   ? null : t.to,
          toGuestId:     toIsGuest   ? t.to : null,
          toGuestName:   toIsGuest   ? t.toName : null,
          amountNIS:     t.amount,
          isGuestParty:  !!(fromIsGuest || toIsGuest),
        }
      })
    }
    res.json(transactions)
  } catch (e: any) { res.status(400).json({ message: e.message }) }
})

export default r