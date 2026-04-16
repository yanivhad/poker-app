import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'
import { Response } from 'express'

const r = Router()

r.get('/leaderboard', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Stats aggregate across ALL gangs the user is an approved member of
    const isMaster = req.user?.role === 'MASTER' || req.user?.role === 'ADMIN'
    let gangFilter: object = {}

    if (!isMaster) {
      const memberships = await prisma.gangMember.findMany({
        where: { userId: req.user!.userId, status: 'APPROVED' },
        select: { gangId: true },
      })
      const gangIds = memberships.map(m => m.gangId)
      gangFilter = gangIds.length > 0 ? { event: { gangId: { in: gangIds } } } : { event: { gangId: null } }
    }

    const results = await prisma.result.findMany({
      where:   { userId: { not: null }, ...gangFilter },
      include: { user: { select: { id: true, nickname: true } } },
    })

    const map = new Map<string, { userId: string; nickname: string; netNIS: number; gamesPlayed: number; wins: number }>()

    for (const r of results) {
      if (!r.userId || !r.user) continue
      const existing = map.get(r.userId)
      if (existing) {
        existing.netNIS      += r.netNIS
        existing.gamesPlayed += 1
        if (r.netNIS > 0) existing.wins += 1
      } else {
        map.set(r.userId, {
          userId:      r.userId,
          nickname:    r.user.nickname,
          netNIS:      r.netNIS,
          gamesPlayed: 1,
          wins:        r.netNIS > 0 ? 1 : 0,
        })
      }
    }

    const leaderboard = Array.from(map.values())
      .map(p => ({ ...p, winRate: p.gamesPlayed > 0 ? (p.wins / p.gamesPlayed) * 100 : 0 }))
      .sort((a, b) => b.netNIS - a.netNIS)

    res.json(leaderboard)
  } catch (e: any) {
    res.status(500).json({ message: e.message })
  }
})

export default r
