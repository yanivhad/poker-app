import { Request, Response, NextFunction } from 'express'
import { verifyAccess } from '../lib/jwt'
export interface AuthRequest extends Request {
  user?:     { userId: string; role: string }
  gangId?:   string
  gangRole?: 'ADMIN' | 'MEMBER'
}
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' })
  try { req.user = verifyAccess(header.split(' ')[1]); next() }
  catch { res.status(401).json({ message: 'Invalid or expired token' }) }
}
