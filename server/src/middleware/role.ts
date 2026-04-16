import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'MASTER' && req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' })
  next()
}
export const requireMaster = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'MASTER' && req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' })
  next()
}
