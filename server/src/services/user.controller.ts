import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import * as UserService from '../services/user.service'

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const includeInactive = req.query.includeInactive === 'true'
    const users = await UserService.getAllUsers(includeInactive)
    res.json(users)
  } catch (e: any) {
    res.status(500).json({ message: e.message })
  }
}

export const getOne = async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserService.getUserById(req.params.id)
    res.json(user)
  } catch {
    res.status(404).json({ message: 'User not found' })
  }
}

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserService.getUserById(req.user!.userId)
    res.json(user)
  } catch {
    res.status(404).json({ message: 'User not found' })
  }
}

export const update = async (req: AuthRequest, res: Response) => {
  try {
    // Players can only update themselves; admins can update anyone
    const targetId = req.params.id
    if (req.user!.role !== 'ADMIN' && req.user!.userId !== targetId)
      return res.status(403).json({ message: 'Forbidden' })

    const { fullName, nickname, favoriteGames, preferredDays } = req.body
    const user = await UserService.updateUser(targetId, { fullName, nickname, favoriteGames, preferredDays })
    res.json(user)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
}

export const setActive = async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserService.setUserActive(req.params.id, req.body.isActive)
    res.json(user)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
}

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserService.createUser(req.body)
    res.status(201).json(user)
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
}