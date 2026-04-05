import { Request, Response } from 'express'
import * as AuthService from '../services/auth.service'
export const requestOtp = async (req: Request, res: Response) => {
  try { res.json(await AuthService.requestOtp(req.body.phone)) }
  catch (e: any) { res.status(400).json({ message: e.message }) }
}
export const verifyOtp = async (req: Request, res: Response) => {
  try { res.json(await AuthService.verifyOtpAndLogin(req.body.phone, req.body.otp)) }
  catch (e: any) { res.status(401).json({ message: e.message }) }
}
export const refresh = async (req: Request, res: Response) => {
  try { res.json(await AuthService.refreshTokens(req.body.refreshToken)) }
  catch { res.status(401).json({ message: 'Invalid refresh token' }) }
}
