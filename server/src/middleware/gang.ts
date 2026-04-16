import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'
import { prisma } from '../lib/prisma'

// Reads X-Gang-Id header, verifies user is an APPROVED member, sets req.gangId + req.gangRole
export const requireGangMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const gangId = req.headers['x-gang-id'] as string | undefined
  if (!gangId) return res.status(400).json({ message: 'X-Gang-Id header required' })

  // MASTER bypasses membership check
  if (req.user?.role === 'MASTER' || req.user?.role === 'ADMIN') {
    req.gangId   = gangId
    req.gangRole = 'ADMIN'
    return next()
  }

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
