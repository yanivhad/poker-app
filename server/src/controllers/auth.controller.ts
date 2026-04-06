import { Request, Response } from 'express'
import * as AuthService from '../services/auth.service'
import { AuthRequest } from '../middleware/auth'

export const login = async (req: Request, res: Response) => {
  try { res.json(await AuthService.login(req.body.phone, req.body.password)) }
  catch (e: any) { res.status(401).json({ message: e.message }) }
}

export const refresh = async (req: Request, res: Response) => {
  try { res.json(await AuthService.refreshTokens(req.body.refreshToken)) }
  catch { res.status(401).json({ message: 'Invalid refresh token' }) }
}

export const logout = (_req: AuthRequest, res: Response) => {
  // Tokens are stateless JWTs — clearing happens client-side.
  // Extend here to blacklist tokens if needed in the future.
  res.json({ message: 'Logged out' })
}
