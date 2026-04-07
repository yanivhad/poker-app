import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import * as UserService from '../services/user.service'
export const getAll  = async (req: AuthRequest, res: Response) => { try { res.json(await UserService.getAllUsers(req.query.includeInactive === 'true')) } catch (e: any) { res.status(500).json({ message: e.message }) } }
export const getOne  = async (req: AuthRequest, res: Response) => { try { res.json(await UserService.getUserById(req.params.id)) } catch { res.status(404).json({ message: 'User not found' }) } }
export const getMe   = async (req: AuthRequest, res: Response) => { try { res.json(await UserService.getUserById(req.user!.userId)) } catch { res.status(404).json({ message: 'User not found' }) } }
export const update  = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'ADMIN' && req.user!.userId !== req.params.id) return res.status(403).json({ message: 'Forbidden' })
    const { fullName, nickname, favoriteGames, preferredDays } = req.body
    res.json(await UserService.updateUser(req.params.id, { fullName, nickname, favoriteGames, preferredDays }))
  } catch (e: any) { res.status(400).json({ message: e.message }) }
}
export const setActive = async (req: AuthRequest, res: Response) => { try { res.json(await UserService.setUserActive(req.params.id, req.body.isActive)) } catch (e: any) { res.status(400).json({ message: e.message }) } }
export const create      = async (req: AuthRequest, res: Response) => { try { res.status(201).json(await UserService.createUser(req.body)) } catch (e: any) { res.status(400).json({ message: e.message }) } }
export const setPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { password } = req.body
    if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })
    await UserService.setPassword(req.params.id, password)
    res.json({ message: 'Password updated' })
  } catch (e: any) { res.status(400).json({ message: e.message }) }
}
export const changeMyPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' })
    await UserService.changeOwnPassword(req.user!.userId, currentPassword, newPassword)
    res.json({ message: 'Password updated' })
  } catch (e: any) { res.status(400).json({ message: e.message }) }
}
