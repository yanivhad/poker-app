import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'
import { prisma } from '../lib/prisma'

// Reads X-Gang-Id header, verifies user is an APPROVED member, sets req.gangId + req.gangRole.
// MASTER/ADMIN bypass membership check and may omit the header (all data returned unfiltered).
export const requireGangMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const isMaster = req.user?.role === 'MASTER' || req.user?.role === 'ADMIN'
  const gangId   = req.headers['x-gang-id'] as string | undefined

  if (isMaster) {
    req.gangId   = gangId   // may be undefined — callers handle that with gangId ? filter : no-filter
    req.gangRole = 'ADMIN'
    return next()
  }

  if (!gangId) return res.status(400).json({ message: 'X-Gang-Id header required' })

  const membership = await prisma.gangMember.findUnique({
    where: { gangId_userId: { gangId, userId: req.user!.userId } }
  })
  if (!membership || membership.status !== 'APPROVED')
    return res.status(403).json({ message: 'Not a member of this gang' })

  req.gangId   = gangId
  req.gangRole = membership.role as 'ADMIN' | 'MEMBER'
  next()
}

// Must be called after requireGangMember
export const requireGangAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role === 'MASTER' || req.user?.role === 'ADMIN') return next()
  if (req.gangRole !== 'ADMIN') return res.status(403).json({ message: 'Gang admin access required' })
  next()
}
